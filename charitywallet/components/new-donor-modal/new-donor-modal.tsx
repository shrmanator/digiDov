"use client";

import { useState, FormEvent } from "react";
import validator from "validator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProfiles } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { upsertDonor } from "@/app/actions/donors";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";
import googlePlacesStyles from "../../styles/google-place-styles";
import { useAuth } from "@/contexts/auth-context";

interface DonorProfileModalProps {
  walletAddress: string;
  open: boolean;
  onClose: () => void;
}

interface GooglePlaceOption {
  label: string;
  value: google.maps.places.AutocompletePrediction;
}

export default function DonorProfileModal({
  walletAddress,
  open,
  onClose,
}: DonorProfileModalProps) {
  const { updateDonor } = useAuth();
  const { data: profiles } = useProfiles({ client });
  const defaultEmail =
    profiles && profiles.length > 0 && profiles[0]?.details?.email
      ? profiles[0].details.email
      : "";

  const [formData, setFormData] = useState({
    email: defaultEmail || "",
    firstName: "",
    lastName: "",
    address: "",
  });

  // Track the selected place for the autocomplete component
  const [selectedPlace, setSelectedPlace] = useState<GooglePlaceOption | null>(
    null
  );
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (option: GooglePlaceOption | null) => {
    if (!option || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ placeId: option.value.place_id }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const fullAddress = results[0].formatted_address;
        // Update the form with the full formatted address
        setFormData((prev) => ({
          ...prev,
          address: fullAddress,
        }));
        // Update the selected place to display the full address in the input field
        setSelectedPlace({ label: fullAddress, value: option.value });
      }
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage(null);

    // Validate email using the validator library
    if (!validator.isEmail(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      setIsLoadingForm(false);
      return;
    }

    try {
      await upsertDonor({
        walletAddress,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
      });
      await updateDonor(walletAddress);
      onClose();
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS") {
        setErrorMessage(
          "This email is already taken. Please use a different one."
        );
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        // Keep modal open until explicitly closed
      }}
      modal={true}
    >
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Welcome to DigiDov
          </DialogTitle>
          <p className="text-muted-foreground text-sm">Tax Receipt Info</p>
          <DialogDescription>
            Provide your details for tax receipts on all future donations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <Input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!}
            selectProps={{
              value: selectedPlace,
              onChange: handleAddressChange,
              placeholder: "Address",
              styles: googlePlacesStyles,
            }}
            autocompletionRequest={{
              componentRestrictions: { country: ["ca"] },
            }}
          />

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoadingForm}>
              {isLoadingForm ? "Saving..." : "Save Info"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
