"use client";

import { useState } from "react";
import ProfileForm from "@/components/profile-form-with-mfa/profile-form";
import MfaModal from "@/components/mfa-modal";
import { toast } from "@/hooks/use-toast";
import { updateCharityProfile } from "@/app/actions/charities";
import { sendOtpAction } from "@/app/actions/mfa";

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
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingData, setPendingData] = useState<any>(null);
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [methodId, setMethodId] = useState("");

  // Handle form submission through MFA flow.
  const handleFormSubmit = async (formData: any) => {
    if (!isVerified) {
      setPendingData(formData);
      setLoading(true);
      setError("");

      // Show a loading toast with the email address.
      toast({
        title: `Sending OTP to ${
          charity.contact_email || "your-email@example.com"
        }...`,
        variant: "default",
      });

      try {
        const response = await sendOtpAction(
          charity.contact_email || "your-email@example.com"
        );
        // Expect response to include an email_id (used as methodId)
        if (response?.email_id) {
          setMethodId(response.email_id);
          setIsMfaOpen(true);
        } else {
          toast({
            title: "Error",
            description: "Failed to send OTP. Please try again.",
            variant: "destructive",
          });
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    } else {
      await updateProfile(formData);
    }
  };

  // Called when the MFA modal successfully verifies the OTP.
  const handleMfaVerified = async () => {
    setIsVerified(true);
    setIsMfaOpen(false);
    if (pendingData) {
      await updateProfile(pendingData);
      setPendingData(null);
    }
  };

  async function updateProfile(data: any) {
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
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
}
