"use client";

import { useState, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserCheckIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ReceiptingAgreementDialog } from "./receipting-agreement-modal";
import { z } from "zod";

// Zod schema for authorized contact fields
const authContactSchema = z.object({
  contact_title: z.string().min(1, "Title is required."),
  contact_first_name: z.string().min(1, "First name is required."),
  contact_last_name: z.string().min(1, "Last name is required."),
  contact_phone: z
    .string()
    .min(1, "Phone number is required.")
    .regex(
      /^\(\d{3}\) \d{3}-\d{4}$/,
      "Phone number must be in format (123) 456-7890."
    ),
  shaduicn: z
    .boolean()
    .refine((val) => val === true, "You must authorize to proceed."),
});

interface CharityAuthorizedContactInfoStepProps {
  formData: z.infer<typeof authContactSchema>;
  charityName: string;
  charityRegistrationNumber: string;
  charityAddress: string;
  isLoading: boolean;
  errorMessage: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onPrevious: () => void;
  onSubmit: () => void;
}

// Format phone as (123) 456-7890
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

export function CharityAuthorizedContactInfoStep({
  formData,
  charityName,
  charityRegistrationNumber,
  charityAddress,
  isLoading,
  errorMessage,
  onChange,
  onPrevious,
  onSubmit,
}: CharityAuthorizedContactInfoStepProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      onChange({
        ...e,
        target: { name, value: checked ? "true" : "", type, checked },
      } as ChangeEvent<HTMLInputElement>);
      return;
    }
    if (name === "contact_phone") {
      e.target.value = formatPhoneNumber(value);
    }
    onChange(e);
  };

  const handleSubmit = () => {
    setLocalError(null);
    const result = authContactSchema.safeParse(formData);
    if (!result.success) {
      setLocalError(result.error.errors[0].message);
      return;
    }
    onSubmit();
  };

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <UserCheckIcon className="text-green-500" />
            <h2 className="text-xl font-semibold">
              Authorization To Sign Donation Receipts
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Allow us to automatically sign your donation receipts on your
            behalf.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:max-w-[90px]">
              <Label htmlFor="contact_title">Title</Label>
              <Input
                id="contact_title"
                name="contact_title"
                value={formData.contact_title}
                onChange={handleChange}
                required
              />
            </div>
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
            <Label htmlFor="contact_phone">Organization Phone Number</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              placeholder="(123) 456-7890"
              value={formData.contact_phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="flex items-start gap-2 mt-4">
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
              } as ChangeEvent<HTMLInputElement>)
            }
            required
          />
          <label
            htmlFor="shaduicn"
            className="text-sm leading-normal mt-[-3px]"
          >
            I authorize digiDov to use my full name as a digital signature on
            automated donation receipts and agree to{" "}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-blue-600 underline"
            >
              Terms and Services
            </button>
          </label>
        </div>

        {(errorMessage || localError) && (
          <p className="text-sm text-red-500 text-center">
            {localError || errorMessage}
          </p>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Back
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Saving..." : "Next"}
          </Button>
        </div>
      </div>

      <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
        <DialogContent className="sm:max-w-[425px]">
          <ReceiptingAgreementDialog
            onClose={() => setShowTermsModal(false)}
            charityName={charityName}
            charityRegistrationNumber={charityRegistrationNumber}
            charityAddress={charityAddress}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
