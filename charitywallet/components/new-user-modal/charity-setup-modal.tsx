"use client";

import { useState, useEffect, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { upsertCharity } from "@/app/actions/charities";
import { useProfiles } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { CharityFormStep } from "./charity-info-step";
import { WalletAddressStep } from "./wallet-address-step";

interface CharitySetupModalProps {
  walletAddress: string;
}

export default function CharitySetupModal({
  walletAddress,
}: CharitySetupModalProps) {
  // Retrieve linked profiles from Thirdweb.
  const { data: profiles } = useProfiles({ client });

  // Extract a default email from profiles if available.
  const defaultEmail =
    profiles && profiles.length > 0 && profiles[0]?.details?.email
      ? profiles[0].details.email
      : "";

  // Manage modal state and steps.
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState<"form" | "confirmation">("form");

  const [formData, setFormData] = useState({
    charity_name: "",
    registered_address: "",
    registration_number: "",
    contact_name: "",
    contact_email: defaultEmail,
    contact_phone: "",
  });
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail && !formData.contact_email) {
      setFormData((prev) => ({ ...prev, contact_email: defaultEmail }));
    }
  }, [defaultEmail, formData.contact_email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage(null);
    try {
      await upsertCharity({
        wallet_address: walletAddress,
        charity_name: formData.charity_name,
        registered_address: formData.registered_address,
        registration_number: formData.registration_number,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        is_profile_complete: true,
      });
      setStep("confirmation");
    } catch (err) {
      console.error("Error upserting charity:", err);
      setErrorMessage(
        "There was an error saving your profile. Please try again."
      );
    } finally {
      setIsLoadingForm(false);
    }
  };

  const handleFinish = () => {
    // The only way to close the modal.
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        // Do nothing to ensure modal can only close via Finish.
      }}
    >
      <DialogContent className="[&>button]:hidden">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Organization Profile</DialogTitle>
              <DialogDescription>
                We need this information to generate tax receipts.
              </DialogDescription>
            </DialogHeader>
            <CharityFormStep
              formData={formData}
              isLoading={isLoadingForm}
              errorMessage={errorMessage}
              onChange={handleChange}
              onNext={handleNext}
            />
          </>
        ) : (
          <WalletAddressStep
            walletAddress={walletAddress}
            onFinish={handleFinish}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
