import { useState, useEffect } from "react";
import { upsertCharity } from "@/app/actions/charities";

export type Step =
  | 'charityOrganizationInfo'
  | 'authorizedContactInfo'
  | 'feeAgreement'
  | 'donationUrl';

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
}

export function useCharitySetup(
  walletAddress: string,
  defaultEmail: string
) {
  const [step, setStep] = useState<Step>('charityOrganizationInfo');
  const [form, setForm] = useState<FormData>({
    charity_name: '',
    registered_address: '',
    registration_number: '',
    contact_title: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_email: '',
    contact_phone: '',
    shaduicn: false,
  });
  const [charitySlug, setCharitySlug] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // inject default email
  useEffect(() => {
    if (defaultEmail) {
      setForm(f => ({ ...f, contact_email: defaultEmail }));
    }
  }, [defaultEmail]);

  const nextOrgInfo = () => {
    setError(null);
    if (form.registration_number.length < 9) {
      setError('Ensure a valid registration number.');
      return;
    }
    setStep('authorizedContactInfo');
  };

  const submitContact = async () => {
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
        is_profile_complete: true,
      });
      setCharitySlug(updated.slug || '');
      setStep('feeAgreement');
    } catch (e) {
      setError('Error saving profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const agreeFee = () => setStep('donationUrl');
  const finish = () => {
    // handled externally by modal
  };

  const back = () => {
    if (step === 'authorizedContactInfo') setStep('charityOrganizationInfo');
    else if (step === 'feeAgreement') setStep('authorizedContactInfo');
    else if (step === 'donationUrl') setStep('feeAgreement');
  };

  return {
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
  };
}
