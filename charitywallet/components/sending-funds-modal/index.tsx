// components/SendingFundsModal.tsx

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
import BalanceDisplay from "./balance-display";
import QuoteDisplay from "./quote-display";
import OtpModal from "@/components/opt-modal";

export default function SendingFundsModal({
  charity,
}: {
  charity: { wallet_address: string; contact_email: string };
}) {
  const {
    amount,
    setAmount,
    quote,
    quoteLoading,
    quoteError,
    handleWithdrawClick,
    isOtpOpen,
    setIsOtpOpen,
    otpError,
    handleOtpVerify,
    depositAddress,
    depositAmount,
    isSendingOnChain,
    chainTxHash,
    transactionId,
    exchangeRate,
  } = usePayTrieOfframp(charity);

  return (
    <Dialog open={Boolean(amount)} onOpenChange={() => {}}>
      <DialogTrigger asChild>
        <Button>Withdraw</Button>
      </DialogTrigger>
      <DialogContent style={{ width: "clamp(320px,90vw,480px)" }}>
        <DialogHeader>
          <DialogTitle>Withdraw Funds</DialogTitle>
        </DialogHeader>

        <BalanceDisplay balance={/* fetch via useTotalUsdcBalance */ 0} />
        <QuoteDisplay quote={quote} />

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
              <strong>TX ID:</strong> {transactionId}
            </p>
            <p>
              <strong>Rate:</strong> {exchangeRate}
            </p>
            <p>
              <strong>On-chain Tx:</strong> {chainTxHash}
            </p>
          </div>
        )}

        {depositAmount != null && depositAddress && (
          <div className="p-2 bg-muted border rounded text-sm space-y-1">
            <p>
              <strong>Sent:</strong> {depositAmount} USDC-POLY to
            </p>
            <pre className="font-mono p-1 bg-muted rounded">
              {depositAddress}
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
