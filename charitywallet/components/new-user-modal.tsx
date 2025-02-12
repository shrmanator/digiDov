"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { upsertCharity } from "@/app/actions/charities";
import { useProfiles } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";

interface CharityProfileModalProps {
  walletAddress: string;
}

export default function CharityProfileModal({
  walletAddress,
}: CharityProfileModalProps) {
  // Retrieve linked profiles from Thirdweb.
  const { data: profiles } = useProfiles({ client });

  // Extract a default email from profiles if available.
  const defaultEmail =
    profiles && profiles.length > 0 && profiles[0]?.details?.email
      ? profiles[0].details.email
      : "";

  const [open, setOpen] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    charity_name: "",
    registered_address: "",
    registration_number: "",
    contact_name: "",
    contact_email: defaultEmail,
    contact_phone: "",
  });
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail && !formData.contact_email) {
      setFormData((prev) => ({ ...prev, contact_email: defaultEmail }));
    }
  }, [defaultEmail, formData.contact_email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage(null);
    try {
      await upsertCharity({
        wallet_address: walletAddress,
        charity_name: formData.charity_name,
        registered_address: formData.registered_address,
        registration_number: formData.registration_number,
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone,
        isProfileComplete: true, // Now the profile is complete.
      });
      setFormSubmitted(true);
      // Allow closing only after successful submission.
      setOpen(false);
    } catch (err) {
      console.error("Error upserting charity:", err);
      setErrorMessage(
        "There was an error saving your profile. Please try again."
      );
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!formSubmitted && value === false) {
          setOpen(true);
        } else {
          setOpen(value);
        }
      }}
    >
      {/* Hide any close button using Tailwind utility */}
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Complete Your Charity Profile</DialogTitle>
          <DialogDescription>
            We need your charity details to issue tax receipts for your
            donations. Please provide the following information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="charity_name">Charity Name</Label>
            <Input
              id="charity_name"
              name="charity_name"
              value={formData.charity_name}
              onChange={handleChange}
              placeholder="Enter your charity name"
              required
            />
          </div>
          <div>
            <Label htmlFor="registered_address">Registered Address</Label>
            <Input
              id="registered_address"
              name="registered_address"
              value={formData.registered_address}
              onChange={handleChange}
              placeholder="Registered Address"
              required
            />
          </div>
          <div>
            <Label htmlFor="registration_number">Registration Number</Label>
            <Input
              id="registration_number"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="Registration Number"
              required
            />
          </div>
          <div>
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              placeholder="Contact Name"
              required
            />
          </div>
          <div>
            <Label htmlFor="contact_phone">Contact Phone</Label>
            <Input
              id="contact_phone"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="Contact Phone"
              required
            />
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoadingForm}>
              {isLoadingForm ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
