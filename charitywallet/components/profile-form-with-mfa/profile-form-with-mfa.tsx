"use client";

import { useState } from "react";
import ProfileForm from "@/components/profile-form-with-mfa/profile-form";
import MfaModal from "@/components/mfa-modal";
import { useMfa } from "@/hooks/mfa";
import { toast } from "@/hooks/use-toast";
import { updateCharityProfile } from "@/app/actions/charities";

interface ProfileWithMfaProps {
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
}

export default function ProfileWithMfa({ charity }: ProfileWithMfaProps) {
  const { isVerified, setIsVerified, sendOtp } = useMfa();
  const [pendingData, setPendingData] = useState<any>(null);
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [methodId, setMethodId] = useState("");

  // Intercept the ProfileForm submission.
  const handleFormSubmit = async (formData: any) => {
    if (!isVerified) {
      setPendingData(formData);
      console.log("Sending OTP to:", charity.contact_email);
      // Trigger sending the OTP email.
      const response = await sendOtp(
        charity.contact_email || "your-email@example.com"
      );
      // Expect response to include an email_id (your methodId)
      if (response && (response as any).email_id) {
        setMethodId((response as any).email_id);
      } else {
        toast({
          title: "Error",
          description: "Failed to send OTP. Please try again.",
          variant: "destructive",
        });
        return;
      }
      setIsMfaOpen(true);
    } else {
      await updateProfile(formData);
    }
  };

  // Called when MFA modal verifies the OTP successfully.
  const handleMfaVerified = async () => {
    setIsVerified(true);
    setIsMfaOpen(false);
    if (pendingData) {
      await updateProfile(pendingData);
      setPendingData(null);
    }
  };

  async function updateProfile(data: any) {
    // Convert data object to FormData, as required by updateCharityProfile
    const fd = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      fd.append(key, String(value));
    });
    try {
      await updateCharityProfile(fd);
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
  }

  return (
    <>
      <ProfileForm charity={charity} onSubmit={handleFormSubmit} />
      <MfaModal
        isOpen={isMfaOpen}
        onOpenChange={setIsMfaOpen}
        methodId={methodId}
        email={charity.contact_email || "your-email@example.com"}
        onVerified={handleMfaVerified}
      />
    </>
  );
}
