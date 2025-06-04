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

  const [draft, setDraft] = useState<number>(initial ?? 0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (draft < 0 || Number.isNaN(draft)) {
      setError("Please enter a valid number ≥ 0.");
      return;
    }

    setSaving(true);
    try {
      await updateCharityAdvantage({
        wallet_address: walletAddress,
        advantage_amount: draft,
      });
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const triggerLabel =
    initial === null ? "Set Advantage" : `Advantage: $${initial.toFixed(2)}`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="default" className={className}>
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Charity Advantage</DialogTitle>
          <DialogDescription>
            Enter how much advantage you want on your tax receipt (in CAD).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              Advantage Amount (CAD)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={draft}
              onChange={(e) => setDraft(parseFloat(e.target.value))}
            />
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
