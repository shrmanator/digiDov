"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function capitalizeFirstLetter(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
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

interface ProfileFormProps {
  charity: {
    charity_name?: string | null;
    registered_office_address?: string | null;
    registration_number?: string | null;
    contact_first_name?: string | null;
    contact_last_name?: string | null;
    contact_email?: string | null;
    contact_mobile_phone?: string | null;
    wallet_address: string;
  };
  onSubmit: (formData: any) => Promise<void> | void;
}

export default function ProfileForm({ charity, onSubmit }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    charity_name: charity.charity_name || "",
    registered_address: charity.registered_office_address || "",
    registration_number: charity.registration_number || "",
    contact_first_name: charity.contact_first_name || "",
    contact_last_name: charity.contact_last_name || "",
    contact_email: charity.contact_email || "",
    contact_phone: charity.contact_mobile_phone || "",
    wallet_address: charity.wallet_address,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "contact_first_name" || name === "contact_last_name") {
      newValue = capitalizeFirstLetter(value);
    } else if (name === "contact_phone") {
      newValue = formatPhoneNumber(value);
    }
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <input
        type="hidden"
        name="wallet_address"
        value={formData.wallet_address}
      />

      <div>
        <Label
          htmlFor="registered_address"
          className="block text-sm font-medium text-foreground"
        >
          Registered Address
        </Label>
        <Input
          id="registered_address"
          name="registered_address"
          placeholder="Registered Address"
          value={formData.registered_address}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <Label
          htmlFor="registration_number"
          className="block text-sm font-medium text-foreground"
        >
          Registration Number
        </Label>
        <Input
          id="registration_number"
          name="registration_number"
          placeholder="Registration Number"
          value={formData.registration_number}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label
            htmlFor="contact_first_name"
            className="block text-sm font-medium text-foreground"
          >
            Contact First Name
          </Label>
          <Input
            id="contact_first_name"
            name="contact_first_name"
            placeholder="First Name"
            value={formData.contact_first_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md border border-border bg-input p-2 text-foreground"
          />
        </div>
        <div>
          <Label
            htmlFor="contact_last_name"
            className="block text-sm font-medium text-foreground"
          >
            Contact Last Name
          </Label>
          <Input
            id="contact_last_name"
            name="contact_last_name"
            placeholder="Last Name"
            value={formData.contact_last_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-md border border-border bg-input p-2 text-foreground"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="contact_email"
          className="block text-sm font-medium text-foreground"
        >
          Contact Email
        </Label>
        <Input
          id="contact_email"
          name="contact_email"
          type="email"
          placeholder="Email Address"
          value={formData.contact_email}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <div>
        <Label
          htmlFor="contact_phone"
          className="block text-sm font-medium text-foreground"
        >
          Contact Phone
        </Label>
        <Input
          id="contact_phone"
          name="contact_phone"
          placeholder="(123) 456-7890"
          value={formData.contact_phone}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-md border border-border bg-input p-2 text-foreground"
        />
      </div>

      <Button
        type="submit"
        className="w-full mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
      >
        Save Profile
      </Button>
    </form>
  );
}
