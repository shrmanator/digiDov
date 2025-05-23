"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import googlePlacesStyles from "@/styles/google-place-styles";
import { Building2Icon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { z } from "zod";

// Zod schema for form fields
const orgInfoSchema = z.object({
  charity_name: z.string().min(1, "Organization name is required."),
  registration_number: z
    .string()
    .min(15, "Registration number must be 15 characters.")
    .max(15, "Registration number must be 15 characters."),
  contact_email: z
    .string()
    .email("Please enter a valid email address.")
    .optional(),
});

interface CharityOrganizationInfoStepProps {
  formData: {
    charity_name: string;
    registered_address: string;
    registration_number: string;
    contact_email: string;
  };
  isLoading: boolean;
  errorMessage: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onAddressChange: (address: string) => void;
  onNext: () => void;
  showEmailField: boolean;
}

interface OptionType {
  label: string;
  value: google.maps.places.AutocompletePrediction;
}

export function CharityOrganizationInfoStep({
  formData,
  isLoading,
  errorMessage,
  onChange,
  onAddressChange,
  onNext,
  showEmailField,
}: CharityOrganizationInfoStepProps) {
  const [placeServiceReady, setPlaceServiceReady] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setPlaceServiceReady(true);
    }
  }, []);

  const handleNext = () => {
    setLocalError(null);

    // Validate schema
    const parsed = orgInfoSchema.safeParse({
      charity_name: formData.charity_name,
      registration_number: formData.registration_number,
      contact_email: showEmailField ? formData.contact_email : undefined,
    });

    if (!parsed.success) {
      // Show the first validation error
      setLocalError(parsed.error.errors[0].message);
      return;
    }

    onNext();
  };

  const handlePlaceSelect = (option: OptionType | null) => {
    if (!option || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: option.value.place_id }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        onAddressChange(results[0].formatted_address);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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
            onChange={onChange}
            required
          />
        </div>

        <div>
          <Label>Registered Address</Label>
          {placeServiceReady ? (
            <GooglePlacesAutocomplete
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!}
              selectProps={{
                value: formData.registered_address
                  ? {
                      label: formData.registered_address,
                      value: formData.registered_address,
                    }
                  : null,
                onChange: handlePlaceSelect,
                styles: googlePlacesStyles,
              }}
              autocompletionRequest={{
                componentRestrictions: { country: ["ca"] },
              }}
            />
          ) : (
            <p>Loading address service...</p>
          )}
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
            maxLength={15}
            minLength={15}
          />
        </div>

        {showEmailField && (
          <div>
            <Label htmlFor="contact_email">Email</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              placeholder="Enter your email address"
              value={formData.contact_email}
              onChange={onChange}
              required
            />
          </div>
        )}

        {(errorMessage || localError) && (
          <p className="text-sm text-red-500 text-center">
            {localError || errorMessage}
          </p>
        )}

        <div className="flex justify-end">
          <Button type="button" onClick={handleNext} disabled={isLoading}>
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
