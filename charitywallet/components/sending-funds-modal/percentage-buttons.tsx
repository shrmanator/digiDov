import { Button } from "../ui/button";

const PRESETS = [
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
];

interface PercentageButtonsProps {
  onSelect: (pct: number) => void;
  disabled?: boolean;
}

export default function PercentageButtons({
  onSelect,
  disabled,
}: PercentageButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {PRESETS.map(({ label, value }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={disabled}
          onClick={() => onSelect(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
