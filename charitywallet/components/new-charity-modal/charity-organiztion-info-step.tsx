"use client";

import { FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import googlePlacesStyles from "@/styles/google-place-styles";
import { Building2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface CharityOrganizationInfoStepProps {
  formData: {
    charity_name: string;
    registered_address: string;
    registration_number: string;
  };
  isLoading: boolean;
  errorMessage: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (address: string) => void;
  onNext: (e: FormEvent<HTMLFormElement>) => void;
}

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CharityOrganizationInfoStep({
  formData,
  isLoading,
  errorMessage,
  onChange,
  onAddressChange,
  onNext,
}: CharityOrganizationInfoStepProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "charity_name") {
      e.target.value = capitalizeFirstLetter(value);
    }

    onChange(e);
  };

  return (
    <form onSubmit={onNext} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Building2Icon className="text-blue-500" />
        <h2 className="text-xl font-semibold">Organization Details</h2>
      </div>
      <p className="text-muted-foreground">
        Enter details exactly as registered with CRA.
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="charity_name">Organization Name</Label>
          <Input
            id="charity_name"
            name="charity_name"
            value={formData.charity_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label>Registered Address</Label>
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
              styles: googlePlacesStyles,
            }}
            autocompletionRequest={{
              componentRestrictions: { country: ["ca"] },
            }}
          />
        </div>
        <div>
          <Label htmlFor="registration_number">CRA Registration Number</Label>
          <Input
            id="registration_number"
            name="registration_number"
            placeholder="123456789RR0001"
            value={formData.registration_number}
            onChange={onChange}
            required
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </form>
  );
}
