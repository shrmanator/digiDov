import { useState, useCallback } from "react";
import type { TxPayload } from "@/app/types/paytrie-transaction-validation";
import { usePayTrieQuote } from "@/hooks/use-paytrie-quotes";
import { usePayTrieTransaction } from "@/hooks/use-paytrie-transaction";
import { useSendCryptoWithoutFee } from "@/hooks/use-send-without-fee";

export interface PayTrieOfframpState {
  amount: string;
  setAmount: (val: string) => void;
  quote: ReturnType<typeof usePayTrieQuote>["quote"];
  quoteLoading: boolean;
  quoteError: Error | null;

  handleWithdrawClick: () => Promise<void>;

  isOtpOpen: boolean;
  setIsOtpOpen: (open: boolean) => void;
  otpError: string;
  handleOtpVerify: (otp: string) => Promise<void>;

  transactionId: string | null;
  exchangeRate: string | null;
  depositAmount: number | null;

  sendOnChain: () => void;
  isSendingOnChain: boolean;
  chainTxHash: string | null;
}

/**
 * Hook for PayTrie off-ramp:
 * 1. Fetch quote
 * 2. Send & verify OTP
 * 3. Create PayTrie transaction
 * 4. Immediately send on-chain USDC-POLY to fixed deposit address
 */
export function usePayTrieOfframp(charity: {
  wallet_address: string;
  contact_email: string;
}): PayTrieOfframpState {
  const [amount, setAmount] = useState("");
  const [pendingPayload, setPendingPayload] = useState<TxPayload | null>(null);
  const [hasSentOtp, setHasSentOtp] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);

  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = usePayTrieQuote();

  const { createTransaction, isSubmitting } = usePayTrieTransaction();

  const amountBigInt =
    depositAmount != null ? BigInt(Math.floor(depositAmount * 1e6)) : BigInt(0);
  const DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!;
  const {
    onClick: sendOnChain,
    isPending: isSendingOnChain,
    transactionResult,
  } = useSendCryptoWithoutFee(amountBigInt, DEPOSIT_ADDRESS);

  const handleWithdrawClick = useCallback(async () => {
    if (!quote || isSubmitting || isOtpOpen) return;
    setOtpError("");
    setTransactionId(null);
    setExchangeRate(null);
    setDepositAmount(null);

    const payload: TxPayload = {
      quoteId: quote.id,
      gasId: quote.gasId,
      email: charity.contact_email,
      wallet: charity.wallet_address,
      leftSideLabel: "USDC-POLY",
      leftSideValue: parseFloat(amount),
      rightSideLabel: "CAD",
    };
    setPendingPayload(payload);

    if (!hasSentOtp) {
      const res = await fetch("/api/paytrie/login-code-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email }),
      });
      if (!res.ok) throw new Error("Unable to send OTP");
      setHasSentOtp(true);
    }

    setIsOtpOpen(true);
  }, [quote, amount, charity, hasSentOtp, isSubmitting, isOtpOpen]);

  const handleOtpVerify = useCallback(
    async (otp: string) => {
      setOtpError("");
      if (!pendingPayload) {
        setOtpError("Missing payload");
        return;
      }

      const verifyRes = await fetch("/api/paytrie/login-code-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: charity.contact_email,
          login_code: otp,
        }),
      });
      const { token: jwt } = await verifyRes.json();
      if (!verifyRes.ok || !jwt) {
        setOtpError("Invalid OTP");
        return;
      }
      setIsOtpOpen(false);

      const data = await createTransaction(pendingPayload, jwt);
      setTransactionId(data.transactionId);
      setExchangeRate(data.exchangeRate);
      setDepositAmount(data.depositAmount);

      sendOnChain();
      setPendingPayload(null);
      setHasSentOtp(false);
    },
    [charity.contact_email, createTransaction, pendingPayload, sendOnChain]
  );

  return {
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
    transactionId,
    exchangeRate,
    depositAmount,
    sendOnChain,
    isSendingOnChain,
    chainTxHash: transactionResult?.transactionHash ?? null,
  };
}
