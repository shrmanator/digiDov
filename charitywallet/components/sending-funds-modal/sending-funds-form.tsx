"use client";

import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { AlertCircle } from "lucide-react";

interface Props {
  register: UseFormRegister<any>;
  errors: FieldErrors;
}

const SendingFundsForm = ({ register, errors }: Props) => (
  <>
    {/* Recipient */}
    <div>
      <label className="block text-xs font-medium mb-1">
        Recipient Wallet Address
      </label>
      <Input
        {...register("recipientAddress", {
          required: "Recipient address is required",
          pattern: {
            value: /^0x[a-fA-F0-9]{40}$/,
            message: "Invalid address (0x + 40 hex chars)",
          },
        })}
        placeholder="0x..."
        className="font-mono"
      />
      {errors.recipientAddress && (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle size={12} />
          {errors.recipientAddress.message as string}
        </p>
      )}
    </div>

    {/* Amount */}
    <div>
      <label className="block text-xs font-medium mb-1">
        Amount to Send&nbsp;(ETH)
      </label>
      <Input
        {...register("amount", {
          required: "Amount is required",
          pattern: {
            value: /^[0-9]*[.,]?[0-9]+$/,
            message: "Invalid number format",
          },
        })}
        placeholder="0.00"
        type="text"
        inputMode="decimal"
        className="font-mono"
      />
      {errors.amount && (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle size={12} />
          {errors.amount.message as string}
        </p>
      )}
    </div>
  </>
);

export default SendingFundsForm;
