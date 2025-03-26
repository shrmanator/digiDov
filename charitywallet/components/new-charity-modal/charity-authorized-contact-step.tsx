"use client";

import { FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCheckIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AuthorizedContactInfoStepProps {
  formData: {
    contact_first_name: string;
    contact_last_name: string;
    contact_phone: string;
    shaduicn: boolean;
  };
  isLoading: boolean;
  errorMessage: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}

function capitalizeFirstLetter(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPhoneNumber(value: string) {
  const phoneNumber = value.replace(/\D/g, "");
  if (phoneNumber.length <= 3) return phoneNumber;
  if (phoneNumber.length <= 6)
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
    3,
    6
  )}-${phoneNumber.slice(6, 10)}`;
}

export function AuthorizedContactInfoStep({
  formData,
  isLoading,
  errorMessage,
  onChange,
  onPrevious,
  onSubmit,
}: AuthorizedContactInfoStepProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      const syntheticEvent = {
        target: {
          name,
          value: checked ? "true" : "",
          type: "checkbox",
          checked,
        },
      } as unknown as ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
      return;
    }

    if (name === "contact_first_name" || name === "contact_last_name") {
      e.target.value = capitalizeFirstLetter(value);
    } else if (name === "contact_phone") {
      e.target.value = formatPhoneNumber(value);
    }

    onChange(e);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Heading and Description */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <UserCheckIcon className="text-green-500" />
          <h2 className="text-xl font-semibold">
            Authorization To Sign Donation Receipts
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Allow us to automatically sign your donation receipts on your behalf.
        </p>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact_first_name">First Name</Label>
          <Input
            id="contact_first_name"
            name="contact_first_name"
            value={formData.contact_first_name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact_last_name">Last Name</Label>
          <Input
            id="contact_last_name"
            name="contact_last_name"
            value={formData.contact_last_name}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact_phone">Phone Number</Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          placeholder="(123) 456-7890"
          value={formData.contact_phone}
          onChange={handleChange}
          required
        />
      </div>

      {/* Checkbox */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="shaduicn"
          name="shaduicn"
          checked={formData.shaduicn}
          onCheckedChange={(checked) =>
            handleChange({
              target: {
                name: "shaduicn",
                value: checked ? "true" : "",
                type: "checkbox",
                checked,
              },
            } as unknown as ChangeEvent<HTMLInputElement>)
          }
          required
        />
        <label htmlFor="shaduicn" className="text-sm leading-normal mt-[-3px]">
          I authorize digiDov to use my full name as a digital signature on
          automated donation receipts.
        </label>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500 text-center">{errorMessage}</p>
      )}

      {/* Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Back
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Next"}
        </Button>
      </div>
    </form>
  );
}
