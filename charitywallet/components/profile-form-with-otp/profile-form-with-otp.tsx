"use client";

import { useState } from "react";
import ProfileForm, {
  ProfileFormData,
} from "@/components/profile-form-with-otp/profile-form";
import { toast } from "@/hooks/use-toast";
import { updateCharityProfileAction } from "@/app/actions/charities";
import { sendOtpAction } from "@/app/actions/otp";
import { Charity } from "@/app/types/charity-client";
import OtpModal from "../opt-modal";

interface ProfileWithOtpProps {
  charity: Charity;
}

export default function ProfileWithOtp({ charity }: ProfileWithOtpProps) {
  const [pendingData, setPendingData] = useState<ProfileFormData | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [methodId, setMethodId] = useState("");

  const handleFormSubmit = async (formData: ProfileFormData) => {
    if (!charity.contact_email) {
      const errorMessage = "No contact email provided.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setPendingData(formData);

    toast({
      title: `Sending OTP to ${charity.contact_email}...`,
      variant: "default",
    });

    try {
      const response = await sendOtpAction(charity.contact_email);
      if (response?.email_id) {
        setMethodId(response.email_id);
        setIsOtpModalOpen(true);
      } else if (response?.error_message) {
        toast({
          title: "Error",
          description: response.error_message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      let errorMessage = "An unknown error occurred.";
      if (err instanceof Error) {
        if (err.message.includes("Too many requests")) {
          errorMessage =
            "Too many OTP requests. Please wait a few minutes before trying again.";
        } else {
          errorMessage = err.message;
        }
      }
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleOtpVerified = async (otp: string) => {
    try {
      if (pendingData) {
        await updateProfile(pendingData, otp);
        setPendingData(null);
        setIsOtpModalOpen(false);
      }
    } catch (error) {
      // The error thrown will be caught by the OTP modal.
      throw error;
    }
  };

  const updateProfile = async (data: ProfileFormData, otp: string) => {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      fd.append(key, String(value));
    });
    try {
      await updateCharityProfileAction(fd, otp, methodId);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
        variant: "default",
      });
    } catch (err: unknown) {
      let friendlyMessage = "Failed to update profile.";
      if (err instanceof Error) {
        if (err.message.includes("otp_code_not_found")) {
          friendlyMessage =
            "The passcode was incorrect. Please try again or request a new one.";
        } else {
          friendlyMessage = err.message;
        }
      }
      throw new Error(friendlyMessage);
    }
  };

  return (
    <>
      <ProfileForm charity={charity} onSubmit={handleFormSubmit} />
      <OtpModal
        isOpen={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        email={charity.contact_email || "no email"}
        onVerified={handleOtpVerified}
      />
    </>
  );
}
