// app/profile/ProfileForm.tsx
"use client";

import { updateCharityProfile } from "@/app/actions/charities";
import { toast } from "@/hooks/use-toast";
import { useTransition } from "react";
import React from "react";

export default function ProfileForm({ charity }: { charity: any }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        // Call your server action; note that updateCharityProfile now does NOT redirect.
        await updateCharityProfile(formData);
        toast({
          title: "Success",
          description: "Profile updated successfully.",
          variant: "default",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update profile.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="hidden"
        name="wallet_address"
        defaultValue={charity.wallet_address}
      />

      <div>
        <label
          htmlFor="charity_name"
          className="block text-sm font-medium text-foreground"
        >
          Charity Name
        </label>
        <input
          type="text"
          id="charity_name"
          name="charity_name"
          defaultValue={charity.charity_name || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="registered_address"
          className="block text-sm font-medium text-foreground"
        >
          Registered Address
        </label>
        <input
          type="text"
          id="registered_address"
          name="registered_address"
          defaultValue={charity.registered_office_address || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="registration_number"
          className="block text-sm font-medium text-foreground"
        >
          Registration Number
        </label>
        <input
          type="text"
          id="registration_number"
          name="registration_number"
          defaultValue={charity.registration_number || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="contact_first_name"
          className="block text-sm font-medium text-foreground"
        >
          Contact First Name
        </label>
        <input
          type="text"
          id="contact_first_name"
          name="contact_first_name"
          defaultValue={charity.contact_first_name || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="contact_last_name"
          className="block text-sm font-medium text-foreground"
        >
          Contact Last Name
        </label>
        <input
          type="text"
          id="contact_last_name"
          name="contact_last_name"
          defaultValue={charity.contact_last_name || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="contact_email"
          className="block text-sm font-medium text-foreground"
        >
          Contact Email
        </label>
        <input
          type="email"
          id="contact_email"
          name="contact_email"
          defaultValue={charity.contact_email || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <label
          htmlFor="contact_phone"
          className="block text-sm font-medium text-foreground"
        >
          Contact Phone
        </label>
        <input
          type="tel"
          id="contact_phone"
          name="contact_phone"
          defaultValue={charity.contact_mobile_phone || ""}
          className="mt-1 block w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </button>
    </form>
  );
}
