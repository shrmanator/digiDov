"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { upsertCharity } from "@/app/actions/charities";
import { useProfiles } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { DonationUrlStep } from "./donation-url-step";
import { FeeAgreementStep } from "./fee-agreement-step";
import { CharityOrganizationInfoStep } from "./charity-organiztion-info-step";
import { AuthorizedContactInfoStep } from "./charity-authorized-contact-step";
import { useRouter } from "next/navigation";

interface CharitySetupModalProps {
  walletAddress: string;
}

function formatPhoneNumber(value: string) {
  const phoneNumber = value.replace(/\D/g, "");
  if (phoneNumber.length <= 3) return phoneNumber;
  if (phoneNumber.length <= 6)
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
}

export default function CharitySetupModal({
  walletAddress,
}: CharitySetupModalProps) {
  const router = useRouter();
  const { data: profiles } = useProfiles({ client });

  // once profiles load, this becomes their email (or stays "" if none)
  const defaultEmail =
    profiles && profiles.length > 0 && profiles[0]?.details?.email
      ? profiles[0].details.email
      : "";

  // only show the input if there's no default
  const showEmailField = defaultEmail === "";

  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<
    | "charityOrganizationInfoStep"
    | "authorizedContactInfoStep"
    | "feeAgreementStep"
    | "donationUrlStep"
  >("charityOrganizationInfoStep");

  const [formData, setFormData] = useState({
    charity_name: "",
    registered_address: "",
    registration_number: "",
    contact_title: "",
    contact_first_name: "",
    contact_last_name: "",
    contact_email: "", // start empty, we'll sync if defaultEmail arrives
    contact_phone: "",
    shaduicn: false,
  });

  const [charitySlug, setCharitySlug] = useState("");
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // sync defaultEmail into formData once it loads
  useEffect(() => {
    if (defaultEmail) {
      setFormData((prev) => ({
        ...prev,
        contact_email: defaultEmail,
      }));
    }
  }, [defaultEmail]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "contact_phone") {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) });
    } else if (name === "registration_number") {
      const upperValue = value.toUpperCase();
      if (/^[A-Za-z0-9]{0,15}$/.test(upperValue)) {
        setFormData({ ...formData, [name]: upperValue });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, registered_address: address }));
  };

  const handleNextCharityInfo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    if (formData.registration_number.length < 9) {
      setErrorMessage("Ensure a valid registration number.");
      return;
    }
    setStep("authorizedContactInfoStep");
  };

  const handleNextAuthorizedContact = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage(null);
    try {
      const updatedCharity = await upsertCharity({
        wallet_address: walletAddress,
        charity_name: formData.charity_name,
        registered_address: formData.registered_address,
        registration_number: formData.registration_number,
        contact_title: formData.contact_title,
        contact_first_name: formData.contact_first_name,
        contact_last_name: formData.contact_last_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        is_profile_complete: true,
      });
      setCharitySlug(updatedCharity.slug || "");
      setStep("feeAgreementStep");
    } catch (err) {
      console.error("Error upserting charity:", err);
      setErrorMessage("Error saving profile. Please try again.");
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleFeeAgree = () => setStep("donationUrlStep");

  // Call router.refresh() when finishing the modal, after it’s closed.
  const handleFinish = () => {
    setOpen(false);
    router.refresh();
  };

  const handleBack = () => {
    if (step === "authorizedContactInfoStep") {
      setStep("charityOrganizationInfoStep");
    } else if (step === "feeAgreementStep") {
      setStep("authorizedContactInfoStep");
    } else if (step === "donationUrlStep") {
      setStep("feeAgreementStep");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        // Only allow programmatic open
        if (isOpen) {
          setOpen(true);
        }
      }}
    >
      <DialogContent className="[&>button]:hidden sm:max-w-xl">
        {step === "charityOrganizationInfoStep" && (
          <CharityOrganizationInfoStep
            formData={{
              charity_name: formData.charity_name,
              registered_address: formData.registered_address,
              registration_number: formData.registration_number,
            }}
            isLoading={isLoadingForm}
            errorMessage={errorMessage}
            onChange={handleChange}
            onAddressChange={handleAddressChange}
            onNext={handleNextCharityInfo}
          />
        )}

        {step === "authorizedContactInfoStep" && (
          <AuthorizedContactInfoStep
            formData={{
              contact_title: formData.contact_title,
              contact_first_name: formData.contact_first_name,
              contact_last_name: formData.contact_last_name,
              contact_email: formData.contact_email,
              contact_phone: formData.contact_phone,
              shaduicn: formData.shaduicn,
            }}
            isLoading={isLoadingForm}
            errorMessage={errorMessage}
            onChange={handleChange}
            onSubmit={handleNextAuthorizedContact}
            onPrevious={handleBack}
            charityName={formData.charity_name}
            charityRegistrationNumber={formData.registration_number}
            charityAddress={formData.registered_address}
            showEmailField={showEmailField}
          />
        )}

        {step === "feeAgreementStep" && (
          <FeeAgreementStep onAgree={handleFeeAgree} onBack={handleBack} />
        )}

        {step === "donationUrlStep" && (
          <DonationUrlStep
            charitySlug={charitySlug}
            onFinish={handleFinish}
            onBack={handleBack}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
