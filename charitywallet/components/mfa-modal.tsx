"use client";

import { useState, ChangeEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyOtpAction } from "@/app/actions/mfa";

interface MfaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  methodId: string;
  email?: string;
  onVerified: () => void;
}

export default function MfaModal({
  isOpen,
  onOpenChange,
  methodId,
  email,
  onVerified,
}: MfaModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setOtp(value.trim());
  };

  const handleVerify = async () => {
    try {
      const { status_code } = await verifyOtpAction(methodId, otp);
      if (status_code === 200) {
        onVerified();
        onOpenChange(false);
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      console.error("MFA verification error:", err);
      setError("An error occurred during verification.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Please enter the OTP sent to your email.
          </DialogDescription>
          {email && (
            <p className="mt-2 text-sm">
              OTP was sent to <strong>{email}</strong>
            </p>
          )}
        </DialogHeader>
        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={handleChange}
          className="mt-4"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleVerify}>Verify</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
