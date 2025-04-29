"use client";

import React, { ChangeEvent, FormEvent } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useProfiles } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { DonationUrlStep } from "./donation-url-step";
import { FeeAgreementStep } from "./fee-agreement-step";
import { CharityOrganizationInfoStep } from "./charity-organiztion-info-step";
import { AuthorizedContactInfoStep } from "./charity-authorized-contact-step";
import { useRouter } from "next/navigation";
import { useCharitySetup } from "@/hooks/use-charity-setup";

interface CharitySetupModalProps {
  walletAddress: string;
}

export default function CharitySetupModal({
  walletAddress,
}: CharitySetupModalProps) {
  const router = useRouter();
  const { data: profiles } = useProfiles({ client });
  const defaultEmail = profiles?.[0]?.details?.email || "";

  const {
    step,
    form,
    setForm,
    charitySlug,
    isLoading,
    error,
    nextOrgInfo,
    submitContact,
    agreeFee,
    finish,
    back,
  } = useCharitySetup(walletAddress, defaultEmail);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  return (
    <Dialog open onOpenChange={() => {}} data-testid="charity-setup-modal">
      <DialogContent className="[&>button]:hidden sm:max-w-xl">
        {step === "charityOrganizationInfo" && (
          <CharityOrganizationInfoStep
            formData={{
              charity_name: form.charity_name,
              registered_address: form.registered_address,
              registration_number: form.registration_number,
            }}
            isLoading={isLoading}
            errorMessage={error}
            onChange={handleChange}
            onAddressChange={(address: string) =>
              setForm((f) => ({ ...f, registered_address: address }))
            }
            onNext={nextOrgInfo}
            data-testid="org-info-step"
          />
        )}
        {step === "authorizedContactInfo" && (
          <AuthorizedContactInfoStep
            formData={{
              contact_title: form.contact_title,
              contact_first_name: form.contact_first_name,
              contact_last_name: form.contact_last_name,
              contact_email: form.contact_email,
              contact_phone: form.contact_phone,
              shaduicn: form.shaduicn,
            }}
            isLoading={isLoading}
            errorMessage={error}
            onChange={handleChange}
            onPrevious={back}
            onSubmit={submitContact}
            charityName={form.charity_name}
            charityRegistrationNumber={form.registration_number}
            charityAddress={form.registered_address}
            showEmailField={!defaultEmail}
            data-testid="contact-info-step"
          />
        )}
        {step === "feeAgreement" && (
          <FeeAgreementStep
            onAgree={agreeFee}
            onBack={back}
            data-testid="fee-agreement-step"
          />
        )}
        {step === "donationUrl" && (
          <DonationUrlStep
            charitySlug={charitySlug}
            onFinish={() => {
              finish();
              router.refresh();
            }}
            onBack={back}
            data-testid="donation-url-step"
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
