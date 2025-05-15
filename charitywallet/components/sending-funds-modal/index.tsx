"use client";
import { usePayTrieOfframp } from "@/hooks/use-paytrie-offramp";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTotalUsdcBalance } from "@/hooks/use-total-usdc-balance";
import BalanceDisplay from "./balance-display";
import QuoteDisplay from "./quote-display";
import OtpModal from "@/components/opt-modal";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email: string };
}) {
  const balance = useTotalUsdcBalance(charity.wallet_address);
  const {
    amount,
    setAmount,
    quoteLoading,
    handleWithdrawClick,
    isOtpOpen,
    setIsOtpOpen,
    otpError,
    handleOtpVerify,
    depositAmount,
    isSendingOnChain,
    chainTxHash,
    transactionId,
  } = usePayTrieOfframp(charity);

  const DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Withdraw</Button>
      </DialogTrigger>

      <DialogContent style={{ width: "clamp(320px,90vw,480px)" }}>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <BalanceDisplay balance={balance} />
        <QuoteDisplay />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleWithdrawClick();
          }}
          className="space-y-4"
        >
          <Input
            type="number"
            step="0.000001"
            min="0"
            placeholder="Amount (USDC-POLY)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={!amount || quoteLoading || isSendingOnChain}
          >
            {isSendingOnChain ? "Sending…" : "Withdraw"}
          </Button>
        </form>

        {otpError && <p className="text-red-600">{otpError}</p>}

        {transactionId && (
          <div className="p-2 bg-muted border rounded text-sm space-y-1">
            <p className="text-success font-medium">Success! 🎉</p>
            <p>
              <strong>On-chain Tx:</strong> {chainTxHash}
            </p>
          </div>
        )}

        {depositAmount != null && (
          <div className="p-2 bg-muted border rounded text-sm space-y-1">
            <p>
              <strong>Sent:</strong> {depositAmount} USDC-POLY to
            </p>
            <pre className="font-mono p-1 bg-muted rounded">
              {DEPOSIT_ADDRESS}
            </pre>
          </div>
        )}
      </DialogContent>

      <OtpModal
        isOpen={isOtpOpen}
        onOpenChange={setIsOtpOpen}
        email={charity.contact_email}
        onVerified={handleOtpVerify}
      />
    </Dialog>
  );
}
