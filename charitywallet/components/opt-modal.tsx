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

export interface OtpModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  onVerified: (otp: string) => Promise<void>;
}

export default function OtpModal({
  isOpen,
  onOpenChange,
  email,
  onVerified,
}: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setOtp(value.trim());
    if (error) setError("");
  };

  // Pass the OTP back to the parent for verification and handle errors inline.
  const handleVerify = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    setIsVerifying(true);
    try {
      // This call will now throw if OTP verification fails.
      await onVerified(otp);
      setError("");
      onOpenChange(false);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "OTP verification failed. Please try again.";
      setError(errorMsg);
      // Keep modal open for another attempt.
    } finally {
      setIsVerifying(false);
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
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={isVerifying}>
            {isVerifying ? "Verifying..." : "Verify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
