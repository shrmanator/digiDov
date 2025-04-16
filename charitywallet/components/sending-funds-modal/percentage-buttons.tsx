"use client";

import { Button } from "@/components/ui/button";

interface Props {
  onSelect: (percentage: number) => void;
}

const PRESETS = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "Max", value: 100 },
];

const PercentageButtons = ({ onSelect }: Props) => (
  <div className="flex gap-2 mt-2">
    {PRESETS.map((p) => (
      <Button
        key={p.label}
        type="button"
        variant="secondary"
        size="sm"
        className="px-2"
        onClick={() => onSelect(p.value)}
      >
        {p.label}
      </Button>
    ))}
  </div>
);

export default PercentageButtons;
