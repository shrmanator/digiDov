import { useState, useEffect } from "react";
import { upsertCharity } from "@/app/actions/charities";

export type Step =
  | "charityOrganizationInfo"
  | "receiptPreference"
  | "authorizedContactInfo"
  | "feeAgreement"
  | "donationUrl";

export interface FormData {
  charity_name: string;
  registered_address: string;
  registration_number: string;
  contact_title: string;
  contact_first_name: string;
  contact_last_name: string;
  contact_email: string;
  contact_phone: string;
  shaduicn: boolean;
  charity_sends_receipt: boolean;
}

export function useCharitySetup(walletAddress: string, defaultEmail?: string) {
  const [step, setStep] = useState<Step>("charityOrganizationInfo");
  const [form, setForm] = useState<FormData>({
    charity_name: "",
    registered_address: "",
    registration_number: "",
    contact_title: "",
    contact_first_name: "",
    contact_last_name: "",
    contact_email: defaultEmail || "",
    contact_phone: "",
    shaduicn: false,
    charity_sends_receipt: false,
  });
  const [charitySlug, setCharitySlug] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) {
      setForm((f) => ({ ...f, contact_email: defaultEmail }));
    }
  }, [defaultEmail]);

  // Step 1: Org Info → Receipt Preference
  const nextOrgInfo = () => {
    setError(null);
    if (form.registration_number.trim().length < 9) {
      setError("Ensure a valid registration number.");
      return;
    }
    setStep("receiptPreference");
  };

  // Step 2: Receipt Preference → Fee Agreement or Authorized Contact Info
  const nextReceiptPref = async () => {
    setError(null);

    if (form.charity_sends_receipt) {
      // Manual import: persist then Fee Agreement
      setIsLoading(true);
      try {
        const updated = await upsertCharity({
          wallet_address: walletAddress,
          charity_name: form.charity_name,
          registered_address: form.registered_address,
          registration_number: form.registration_number,
          contact_title: form.contact_title,
          contact_first_name: form.contact_first_name,
          contact_last_name: form.contact_last_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          charity_sends_receipt: form.charity_sends_receipt,
          is_profile_complete: true,
        });
        setCharitySlug(updated.slug || "");
        setStep("feeAgreement");
      } catch {
        setError("Error saving profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // digiDov sends receipts: collect contact info next
      setStep("authorizedContactInfo");
    }
  };

  // Step 3: Save contact info → Fee Agreement
  const submitAuthorizedContact = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await upsertCharity({
        wallet_address: walletAddress,
        charity_name: form.charity_name,
        registered_address: form.registered_address,
        registration_number: form.registration_number,
        contact_title: form.contact_title,
        contact_first_name: form.contact_first_name,
        contact_last_name: form.contact_last_name,
        contact_email: form.contact_email,
        contact_phone: form.contact_phone,
        charity_sends_receipt: form.charity_sends_receipt,
        is_profile_complete: true,
      });
      setCharitySlug(updated.slug || "");
      setStep("feeAgreement");
    } catch {
      setError("Error saving contact info. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Fee Agreement → Donation URL
  const agreeFee = () => setStep("donationUrl");

  // Finalize
  const finish = () => {};

  // Back navigation
  const back = () => {
    switch (step) {
      case "receiptPreference":
        setStep("charityOrganizationInfo");
        break;
      case "authorizedContactInfo":
        setStep("receiptPreference");
        break;
      case "feeAgreement":
        setStep(
          form.charity_sends_receipt
            ? "receiptPreference"
            : "authorizedContactInfo"
        );
        break;
      case "donationUrl":
        setStep("feeAgreement");
        break;
    }
  };

  return {
    step,
    form,
    setForm,
    charitySlug,
    isLoading,
    error,
    nextOrgInfo,
    nextReceiptPref,
    submitAuthorizedContact,
    agreeFee,
    finish,
    back,
  };
}
