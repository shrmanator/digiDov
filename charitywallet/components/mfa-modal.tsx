"use client";

import { useState } from "react";
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

type MfaModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  methodId: string; // This is provided from the OTP send response
  email?: string;
  onVerified: () => void;
};

export default function MfaModal({
  isOpen,
  onOpenChange,
  methodId,
  email,
  onVerified,
}: MfaModalProps) {
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");

  async function handleVerify() {
    try {
      const res = await fetch("/api/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method_id: methodId, code: otp }),
      });
      const data = await res.json();
      if (data.status_code === 200) {
        onVerified();
        onOpenChange(false);
      } else {
        setLocalError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      setLocalError("An error occurred during verification.");
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Please enter the OTP sent to your email to confirm this action.
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
          onChange={(e) => setOtp(e.target.value)}
          className="mt-4"
        />
        {localError && (
          <p className="mt-2 text-sm text-red-600">{localError}</p>
        )}
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
