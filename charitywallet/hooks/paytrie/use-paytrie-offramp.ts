import { useState, useCallback } from "react";

import { useSendCryptoWithoutFee } from "@/hooks/use-send-without-fee";
import { usePayTrieAuth } from "./use-paytrie-auth";
import { usePayTrieQuote } from "./use-paytrie-quotes";
import { usePayTrieTransaction } from "./use-paytrie-transaction";
import { buildPaytrieSellOrderPayload } from "@/utils/paytrie/build-paytrie-transaction-payload";

export function usePayTrieOfframp(
  wallet_address: string,
  contact_email: string
) {
  const [amount, setAmount] = useState("");
  const [jwt, setJwt] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);

  const { sendOtp, verifyOtp } = usePayTrieAuth(contact_email);
  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = usePayTrieQuote();
  const { createTransaction, isSubmitting: apiLoading } =
    usePayTrieTransaction();

  const amountBigInt =
    depositAmount != null ? BigInt(Math.floor(depositAmount * 1e6)) : BigInt(0);
  const DEPOSIT_ADDRESS = process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!;
  const { onClick: sendOnChain, isPending: isSendingOnChain } =
    useSendCryptoWithoutFee(amountBigInt, DEPOSIT_ADDRESS);

  const initiateWithdraw = useCallback(async () => {
    if (!quote || apiLoading || !amount) return;
    await sendOtp();
  }, [quote, apiLoading, amount, sendOtp]);

  const confirmOtp = useCallback(
    async (code: string) => {
      const token = await verifyOtp(code);
      setJwt(token);
      const payload = buildPaytrieSellOrderPayload(
        parseFloat(amount),
        quote!,
        wallet_address,
        contact_email
      );
      const tx = await createTransaction(payload, token);
      setTransactionId(tx.transactionId);
      setExchangeRate(tx.exchangeRate);
      setDepositAmount(tx.depositAmount);
      sendOnChain();
    },
    [
      amount,
      quote,
      wallet_address,
      contact_email,
      verifyOtp,
      createTransaction,
      sendOnChain,
    ]
  );

  return {
    amount,
    setAmount,
    quote,
    quoteLoading,
    quoteError,
    initiateWithdraw,
    confirmOtp,
    transactionId,
    exchangeRate,
    depositAmount,
    isSendingOnChain,
  };
}
