"use client";

import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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

  // Automatically open the modal if the profile is incomplete
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
        walletAddress: walletAddress,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
      });

      setOpen(false); // Close modal when profile is complete
    } catch (err) {
      console.error("Error updating donor profile:", err);
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
      onOpenChange={() => {
        // Prevent closing until profile is complete
        if (!isIncomplete) setOpen(false);
      }}
    >
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please fill out your details to fully activate your donor account.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isLoadingForm}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            {isLoadingForm ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
