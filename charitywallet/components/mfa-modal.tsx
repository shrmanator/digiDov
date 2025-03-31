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
import { verifyOtpAction } from "@/app/actions/mfa";

/**
 * MFA Modal that uses a server action to verify the OTP.
 */
export default function MfaModal({
  isOpen,
  onOpenChange,
  methodId,
  email,
  onVerified,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  methodId: string; // Provided by the OTP send action
  email?: string;
  onVerified: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [localError, setLocalError] = useState("");

  async function handleVerify() {
    try {
      // Directly call the server action:
      const result = await verifyOtpAction(methodId, otp);
      console.log("Server action verify response:", result);
      if (result.status_code === 200) {
        onVerified();
        onOpenChange(false);
      } else {
        setLocalError("Verification failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Error during MFA verification:", err);
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
          onChange={(e) => setOtp(e.target.value.trim())}
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
