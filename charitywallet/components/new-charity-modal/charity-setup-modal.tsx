"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { upsertCharity } from "@/app/actions/charities"; // Server Action.
import { useProfiles } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { CharityInfoStep } from "./charity-info-step";
import { DonationLinkStep } from "./wallet-address-step";
import { DelegationAgreementStep } from "./delegation-agreement-step";

interface CharitySetupModalProps {
  walletAddress: string;
}

// Helper function to format phone numbers as (123) 456-7890
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
  const { data: profiles } = useProfiles({ client });
  const [charitySlug, setCharitySlug] = useState<string>("");

  // Get default email from profiles
  const defaultEmail =
    profiles && profiles.length > 0 && profiles[0]?.details?.email
      ? profiles[0].details.email
      : "";

  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<"form" | "delegation" | "confirmation">(
    "form"
  );

  const [formData, setFormData] = useState({
    charity_name: "",
    registered_address: "",
    registration_number: "",
    contact_name: "",
    contact_phone: "",
  });

  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "contact_phone") {
      setFormData({ ...formData, [name]: formatPhoneNumber(value) });
    } else if (name === "registration_number") {
      if (/^\d{0,15}$/.test(value)) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddressChange = (address: string) => {
    setFormData((prev) => ({ ...prev, registered_address: address }));
  };

  // After Charity Info is completed, save and then move to the delegation step.
  const handleNext = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage(null);

    if (formData.registration_number.length < 9) {
      setErrorMessage("Ensure valid registration number.");
      setIsLoadingForm(false);
      return;
    }

    try {
      const updatedCharity = await upsertCharity({
        wallet_address: walletAddress,
        charity_name: formData.charity_name,
        registered_address: formData.registered_address,
        registration_number: formData.registration_number,
        contact_name: formData.contact_name,
        contact_email: defaultEmail,
        contact_phone: formData.contact_phone,
        is_profile_complete: true,
      });
      setCharitySlug(updatedCharity.slug || "");
      // Move to the Delegation Agreement step.
      setStep("delegation");
    } catch (err) {
      console.error("Error upserting charity:", err);
      setErrorMessage(
        "There was an error saving your profile. Please try again."
      );
    } finally {
      setIsLoadingForm(false);
    }
  };

  // Once the delegation agreement is accepted, move to the final step.
  const handleDelegationAgree = () => {
    setStep("confirmation");
  };

  const handleFinish = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="[&>button]:hidden">
        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Organization Profile</DialogTitle>
              <DialogDescription>
                We need this information to generate tax receipts.
              </DialogDescription>
            </DialogHeader>
            <CharityInfoStep
              formData={formData}
              isLoading={isLoadingForm}
              errorMessage={errorMessage}
              onChange={handleChange}
              onAddressChange={handleAddressChange}
              onNext={handleNext}
            />
          </>
        )}

        {step === "delegation" && (
          <DelegationAgreementStep onAgree={handleDelegationAgree} />
        )}

        {step === "confirmation" && (
          <DonationLinkStep charitySlug={charitySlug} onFinish={handleFinish} />
        )}
      </DialogContent>
    </Dialog>
  );
}
