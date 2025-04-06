"use client";

import { useState } from "react";
import ProfileForm, {
  ProfileFormData,
} from "@/components/profile-form-with-otp/profile-form";
import { toast } from "@/hooks/use-toast";
import { updateCharityProfile } from "@/app/actions/charities";
import { sendOtpAction } from "@/app/actions/otp";
import { Charity } from "@/app/types/charity-client";
import OtpModal from "../opt-modal";

interface ProfileWithOtpProps {
  charity: Charity;
}

export default function ProfileWithOtp({ charity }: ProfileWithOtpProps) {
  const [error, setError] = useState("");
  const [pendingData, setPendingData] = useState<ProfileFormData | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [methodId, setMethodId] = useState("");

  const handleFormSubmit = async (formData: ProfileFormData) => {
    if (!charity.contact_email) {
      const errorMessage = "No contact email provided.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    setPendingData(formData);
    setError("");

    toast({
      title: `Sending OTP to ${charity.contact_email}...`,
      variant: "default",
    });

    try {
      const response = await sendOtpAction(charity.contact_email);
      if (response?.email_id) {
        setMethodId(response.email_id);
        setIsOtpModalOpen(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // The OTP modal now returns the OTP without performing verification.
  const handleOtpVerified = async (otp: string) => {
    setIsOtpModalOpen(false);
    if (pendingData) {
      await updateProfile(pendingData, otp);
      setPendingData(null);
    }
  };

  const updateProfile = async (data: ProfileFormData, otp: string) => {
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      fd.append(key, String(value));
    });
    try {
      // Pass both the OTP and methodId to the server.
      await updateCharityProfile(fd, otp, methodId);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
        variant: "default",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <ProfileForm charity={charity} onSubmit={handleFormSubmit} />
      <OtpModal
        isOpen={isOtpModalOpen}
        onOpenChange={setIsOtpModalOpen}
        methodId={methodId}
        email={charity.contact_email || "your-email@example.com"}
        onVerified={handleOtpVerified}
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}
