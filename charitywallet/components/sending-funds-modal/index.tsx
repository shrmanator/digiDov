// components/SendingFundsModal.tsx
"use client";
import { useState, FormEvent } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";
import { usePayTrieTransaction } from "@/hooks/use-paytrie-transaction";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";
import BalanceDisplay from "./balance-display";
import { useWalletBalance } from "@/hooks/use-wallet-balance";
import QuoteDisplay from "./quote-display";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email?: string | null };
}) {
  const [open, setOpen] = useState(false);
  const balance = useWalletBalance(charity.wallet_address);

  const { quote, isLoading: qL, error: qE } = usePayTrieQuote();
  const [amount, setAmount] = useState("");

  const { execute, data, error, isLoading } = usePayTrieTransaction();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!quote || isLoading) return;

    const payload: TxPayload = {
      quoteId: quote.id,
      gasId: quote.gasId,
      email: charity.contact_email ?? "",
      wallet: charity.wallet_address,
      leftSideLabel: "USDC-POLY",
      leftSideValue: parseFloat(amount),
      rightSideLabel: "CAD",
    };

    try {
      await execute(payload);
    } catch {
      // error is in `error`
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Withdraw</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <BalanceDisplay balance={balance} />
        <QuoteDisplay />

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="number"
            step="0.0001"
            min="0"
            placeholder="Amount (USDC‑POLY)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="w-full border rounded p-2"
          />

          <Button
            type="submit"
            disabled={
              !quote || !amount || isNaN(Number(amount)) || isLoading || !!data
            }
            className="w-full"
          >
            {isLoading ? "Processing…" : data ? "Done!" : "Withdraw"}
          </Button>
        </form>

        {qL && <p>Loading pricing…</p>}
        {qE && <p className="text-red-600">{qE.message}</p>}

        {error && (
          <p className="text-red-600 mt-2">
            Something went wrong: {error.message}
          </p>
        )}

        {data && (
          <div className="mt-2 p-2 bg-muted border rounded text-sm">
            <p className="text-success font-medium">Success! 🎉</p>
            <p className="break-all font-mono mt-1">{data.tx}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
