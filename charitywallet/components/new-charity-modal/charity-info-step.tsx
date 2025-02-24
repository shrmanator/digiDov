"use client";

import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CharityFormStepProps {
  formData: {
    charity_name: string;
    registered_address: string;
    registration_number: string;
    contact_name: string;
    contact_phone: string;
  };
  isLoading: boolean;
  errorMessage: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: (e: FormEvent<HTMLFormElement>) => void;
}

export function CharityFormStep({
  formData,
  isLoading,
  errorMessage,
  onChange,
  onNext,
}: CharityFormStepProps) {
  return (
    <form onSubmit={onNext} className="space-y-4">
      <Input
        id="charity_name"
        name="charity_name"
        value={formData.charity_name}
        onChange={onChange}
        placeholder="Name of Registered Charity"
        required
      />
      <Input
        id="registered_address"
        name="registered_address"
        value={formData.registered_address}
        onChange={onChange}
        placeholder="Registered Office Address"
        required
      />
      <Input
        id="registration_number"
        name="registration_number"
        value={formData.registration_number}
        onChange={onChange}
        placeholder="Charitable Registration Number"
        required
      />
      <Input
        id="contact_name"
        name="contact_name"
        value={formData.contact_name}
        onChange={onChange}
        placeholder="Public Contact Name"
        required
      />
      <Input
        id="contact_phone"
        name="contact_phone"
        value={formData.contact_phone}
        onChange={onChange}
        placeholder="Public Contact Phone Number"
        required
      />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </form>
  );
}
