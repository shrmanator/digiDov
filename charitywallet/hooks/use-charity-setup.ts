import { useState, useEffect } from "react";

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

  // Helper: call the unified API route
  const upsertViaApi = async (body: Record<string, any>) => {
    const res = await fetch("/api/charity-dashboard/overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Server error");
    return json.charity;
  };

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
      setIsLoading(true);
      try {
        const charity = await upsertViaApi({
          wallet_address: walletAddress,
          charity_name: form.charity_name,
          registered_address: form.registered_address,
          registration_number: form.registration_number,
          charity_sends_receipt: form.charity_sends_receipt,
          is_profile_complete: true,
        });
        setCharitySlug(charity.slug || "");
        setStep("feeAgreement");
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setStep("authorizedContactInfo");
    }
  };

  // Step 3: Save contact info → Fee Agreement
  const submitAuthorizedContact = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const charity = await upsertViaApi({
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
      setCharitySlug(charity.slug || "");
      setStep("feeAgreement");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4: Fee Agreement → Donation URL
  const agreeFee = () => setStep("donationUrl");

  // Finalize (no-op, just close modal)
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
