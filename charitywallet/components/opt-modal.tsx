// components/OtpModal.tsx

"use client";

import React, { useState, ChangeEvent } from "react";
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
import { toast } from "@/hooks/use-toast";

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
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setOtp(value.trim());
  };

  const handleVerify = async () => {
    if (!otp) {
      toast({ title: "Invalid Code", description: "Please enter the OTP." });
      return;
    }
    setIsVerifying(true);
    try {
      await onVerified(otp);
      onOpenChange(false);
      setOtp("");
    } catch (err: any) {
      const raw = err?.message ?? String(err);
      let msg = "OTP verification failed. Please try again.";
      if (typeof raw === "string") {
        const outerMatch = raw.match(/\{[^]*\}/);
        if (outerMatch) {
          try {
            const parsedOuter = JSON.parse(outerMatch[0]);
            if (parsedOuter.error) {
              const innerMatch = (parsedOuter.error as string).match(
                /\{[^]*\}/
              );
              if (innerMatch) {
                const parsedInner = JSON.parse(innerMatch[0]);
                msg = parsedInner.message || msg;
              } else {
                msg = parsedOuter.error as string;
              }
            } else if (parsedOuter.message) {
              msg = parsedOuter.message;
            }
          } catch {
            msg = raw;
          }
        } else {
          msg = raw;
        }
      }
      toast({ title: "OTP Error", description: msg, variant: "destructive" });
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
            Enter the 6-digit code sent to your email.
          </DialogDescription>
          {email && (
            <p className="mt-2 text-sm">
              Code sent to <strong>{email}</strong>
            </p>
          )}
        </DialogHeader>

        <Input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={handleChange}
          className="mt-4"
          disabled={isVerifying}
        />

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
