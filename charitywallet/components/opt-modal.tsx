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

interface OtpModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  onVerified: (otp: string) => void;
}

export default function OtpModal({
  isOpen,
  onOpenChange,
  email,
  onVerified,
}: OtpModalProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setOtp(value.trim());
  };

  // Instead of verifying OTP here, simply return the OTP value.
  const handleVerify = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    // Close the modal and pass the OTP back.
    onVerified(otp);
    onOpenChange(false);
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
