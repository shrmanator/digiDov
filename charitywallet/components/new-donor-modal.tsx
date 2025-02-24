"use client";

import { useState, FormEvent } from "react";
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
import { useIncompleteDonorProfile } from "@/hooks/use-incomplete-donor-profile";

interface DonorProfileModalProps {
  walletAddress: string;
}

export default function DonorProfileModal({
  walletAddress,
}: DonorProfileModalProps) {
  const { data: profiles } = useProfiles({ client });
  const { isIncomplete, isLoading } = useIncompleteDonorProfile(walletAddress);
  const [open, setOpen] = useState(false);

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

  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isIncomplete && !open && !isLoading) {
    setOpen(true);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingForm(true);
    setErrorMessage(null);

    try {
      await upsertDonor({
        walletAddress,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
      });
      setOpen(false);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error saving info. Please try again.");
    } finally {
      setIsLoadingForm(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (!isIncomplete) setOpen(false);
      }}
    >
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Tax Receipt Info</DialogTitle>
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
          <Input
            id="address"
            name="address"
            type="text"
            placeholder="Mailing Address"
            value={formData.address}
            onChange={handleChange}
            required
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
