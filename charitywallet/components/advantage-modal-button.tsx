"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { updateCharityAdvantage } from "@/app/actions/charities";

type AdvantageModalButtonProps = {
  initial: number | null;
  walletAddress: string;
  className?: string;
};

export function AdvantageModalButton({
  initial,
  walletAddress,
  className,
}: AdvantageModalButtonProps) {
  const router = useRouter();

  // control whether the Dialog is open
  const [open, setOpen] = useState(false);

  // Store the input as a string so we never pass NaN into the <Input> value
  const [draft, setDraft] = useState<string>(
    initial !== null && initial > 0 ? initial.toFixed(2) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // If the input is empty, treat it as 0
    const parsed = draft.trim() === "" ? 0 : parseFloat(draft);
    if (isNaN(parsed) || parsed < 0) {
      setError("Please enter a valid number ≥ 0.");
      return;
    }

    setSaving(true);
    try {
      await updateCharityAdvantage({
        wallet_address: walletAddress,
        advantage_amount: parsed,
      });
      router.refresh();

      // Close the modal on successful save
      setOpen(false);
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  // If initial is 0 or null, treat as "no advantage"
  const hasAdvantage = initial !== null && initial > 0;
  const triggerLabel = hasAdvantage
    ? `Advantage: $${initial!.toFixed(2)}`
    : "Set Advantage";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className={className}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Charity Advantage</DialogTitle>
          <DialogDescription>
            Enter how much advantage you want on your tax receipts (in CAD).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Advantage Amount (CAD)
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                className="pl-6"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
            </div>
            {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="secondary" type="button" disabled={saving}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
