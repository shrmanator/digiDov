// hooks/paytrie/use-paytrie-offramp.ts

import { useState, useCallback } from "react";
import { usePayTrieAuth } from "./use-paytrie-auth";
import { usePayTrieQuote } from "./use-paytrie-quotes";
import { usePaytrieSellOrder } from "./use-paytrie-sell-order";
import { buildPaytrieSellOrderPayload } from "@/utils/paytrie/build-paytrie-transaction-payload";
import { useSendErc20Token } from "../use-send-erc20-token";
import { polygon } from "thirdweb/chains";

export function usePayTrieOfframp(
  wallet_address: string,
  contact_email: string
) {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);

  const amtNum = parseFloat(amount) || 0;
  const { sendOtp, verifyOtp } = usePayTrieAuth(contact_email);
  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = usePayTrieQuote(amtNum);
  const { placeSellOrder, isSubmitting: apiLoading } = usePaytrieSellOrder();

  const { onClick: sendOnChain, isPending: isSendingOnChain } =
    useSendErc20Token(
      amtNum.toString(),
      process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!,
      process.env.NEXT_PUBLIC_POLYGON_USDC_ADDRESS!,
      polygon
    );

  const initiateWithdraw = useCallback(async () => {
    if (!quote || apiLoading || amtNum <= 0) return;
    await sendOtp();
  }, [quote, apiLoading, amtNum, sendOtp]);

  const confirmOtp = useCallback(
    async (code: string) => {
      // 1) verify the OTP
      const token = await verifyOtp(code);

      // 2) place the sell order
      const payload = buildPaytrieSellOrderPayload(
        amtNum,
        quote!,
        wallet_address,
        contact_email
      );
      const txResult = await placeSellOrder(payload, token);

      // 3) update local state
      setTransactionId(txResult.transactionId);
      setExchangeRate(txResult.exchangeRate);

      // 4) immediately send on‐chain
      await sendOnChain();
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
    isSendingOnChain,
  };
}
