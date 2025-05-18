// hooks/paytrie/use-paytrie-offramp.ts

import { useState, useCallback } from "react";
import { usePayTrieAuth } from "./use-paytrie-auth";
import { usePayTrieQuote } from "./use-paytrie-quotes"; // <-- now takes an amount argument
import { usePaytrieSellOrder } from "./use-paytrie-sell-order";
import { buildPaytrieSellOrderPayload } from "@/utils/paytrie/build-paytrie-transaction-payload";
import { useSendErc20Token } from "../use-send-erc20-token";
import { polygon } from "thirdweb/chains";

export function usePayTrieOfframp(
  wallet_address: string,
  contact_email: string
) {
  const [amount, setAmount] = useState(""); // string from input
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number | null>(null);

  const { sendOtp, verifyOtp } = usePayTrieAuth(contact_email);

  // 1) parse the input into a number
  const amtNum = parseFloat(amount) || 0;

  // 2) pass that number into your quote hook so it actually fetches a quote
  const {
    quote, // PayTrieQuote | null
    isLoading: quoteLoading,
    error: quoteError,
  } = usePayTrieQuote(amtNum);

  const { placeSellOrder, isSubmitting: apiLoading } = usePaytrieSellOrder();

  const { onClick: sendOnChain, isPending: isSendingOnChain } =
    useSendErc20Token(
      (depositAmount ?? 0).toString(),
      process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!,
      process.env.NEXT_PUBLIC_POLYGON_USDC_ADDRESS!,
      polygon
    );

  const initiateWithdraw = useCallback(async () => {
    // now quote is non-null only when amtNum > 0 and fetched
    if (!quote || apiLoading || amtNum <= 0) return;
    await sendOtp();
  }, [quote, apiLoading, amtNum, sendOtp]);

  const confirmOtp = useCallback(
    async (code: string) => {
      const token = await verifyOtp(code);

      // 3) build payload using the actual PayTrieQuote object
      const payload = buildPaytrieSellOrderPayload(
        amtNum,
        quote!, // must be non-null here
        wallet_address,
        contact_email
      );

      const tx = await placeSellOrder(payload, token);
      setTransactionId(tx.transactionId);
      setExchangeRate(tx.exchangeRate);
      setDepositAmount(tx.depositAmount);

      // finally send on‐chain
      sendOnChain();
    },
    [
      amtNum,
      quote,
      wallet_address,
      contact_email,
      verifyOtp,
      placeSellOrder,
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
