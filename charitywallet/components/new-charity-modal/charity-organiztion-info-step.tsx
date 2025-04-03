"use client";

import { FormEvent, ChangeEvent, useEffect, useState } from "react";
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

// Define the OptionType for GooglePlacesAutocomplete option
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
}: CharityOrganizationInfoStepProps) {
  const [placeServiceReady, setPlaceServiceReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      setPlaceServiceReady(true);
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Removed auto-capitalization logic
    onChange(e);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onNext(e);
  };

  const handlePlaceSelect = (option: OptionType | null) => {
    if (!option || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: option.value.place_id }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const fullAddress = results[0].formatted_address;
        onAddressChange(fullAddress);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
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
