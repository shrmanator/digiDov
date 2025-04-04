import React, { useState, ChangeEvent, FocusEvent } from "react";

interface USDCAmountInputProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  minAmount?: number;
  placeholder?: string;
  className?: string;
}

export const USDCAmountInput: React.FC<USDCAmountInputProps> = ({
  value,
  onChange,
  minAmount = 0.001,
  placeholder = "Custom amount",
  className = "",
}) => {
  const [error, setError] = useState<string>("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Clear error when input is empty
    if (newValue === "") {
      setError("");
      onChange(newValue, true);
      return;
    }

    const numericValue = parseFloat(newValue);
    const isValid = numericValue >= minAmount;

    // Validate minimum amount
    if (!isValid) {
      setError(`Minimum amount is ${minAmount} USDC`);
    } else {
      setError("");
    }

    onChange(newValue, isValid);
  };

  // Enforce minimum on blur for better UX
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (value !== "" && parseFloat(value) < minAmount) {
      onChange(minAmount.toString(), true);
      setError("");
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="relative flex">
        <div className="flex items-center justify-center px-4 bg-muted border border-input rounded-l-md text-sm">
          USDC
        </div>
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          className={`flex-1 h-10 px-4 py-2 rounded-r-md border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            error ? "border-red-500 focus-visible:ring-red-500" : ""
          }`}
          min={minAmount}
          step="0.001"
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};
