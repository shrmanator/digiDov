// components/PercentageButtons.tsx

"use client";

import { Button } from "@/components/ui/button";

interface PercentageButtonsProps {
  onSelect: (percentage: number) => void;
  disabled?: boolean;
}

const PRESETS = [
  { label: "10%", value: 10 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "Max", value: 100 },
];

const PercentageButtons = ({
  onSelect,
  disabled = false,
}: PercentageButtonsProps) => (
  <div className="flex items-center justify-between gap-2 py-2">
    {PRESETS.map((preset) => (
      <Button
        key={preset.label}
        type="button"
        variant="outline"
        size="sm"
        className="w-full"
        disabled={disabled}
        onClick={() => onSelect(preset.value)}
      >
        {preset.label}
      </Button>
    ))}
  </div>
);

export default PercentageButtons;
