"use client";

import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import googlePlacesStyles from "@/styles/google-place-styles";

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
  onAddressChange: (address: string) => void;
}

export function CharityFormStep({
  formData,
  isLoading,
  errorMessage,
  onChange,
  onNext,
  onAddressChange,
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
      <GooglePlacesAutocomplete
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!}
        selectProps={{
          value: formData.registered_address
            ? {
                label: formData.registered_address,
                value: formData.registered_address,
              }
            : null,
          onChange: (option) => onAddressChange(option?.label || ""),
          placeholder: "Registered Office Address",
          styles: googlePlacesStyles,
        }}
        autocompletionRequest={{
          componentRestrictions: { country: ["ca"] },
        }}
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
