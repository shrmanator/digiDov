// hooks/paytrie/use-paytrie-offramp.ts

import { useState, useCallback, useEffect } from "react";
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
  const [depositAmount, setDepositAmount] = useState<number | null>(null);

  const { sendOtp, verifyOtp } = usePayTrieAuth(contact_email);
  const amtNum = parseFloat(amount) || 0;
  const {
    quote,
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
    if (!quote || apiLoading || amtNum <= 0) return;
    await sendOtp();
  }, [quote, apiLoading, amtNum, sendOtp]);

  const confirmOtp = useCallback(
    async (code: string) => {
      if (code) {
        // REAL FLOW
        const token = await verifyOtp(code);
        const payload = buildPaytrieSellOrderPayload(
          amtNum,
          quote!,
          wallet_address,
          contact_email
        );
        const tx = await placeSellOrder(payload, token);
        setTransactionId(tx.transactionId);
        setExchangeRate(tx.exchangeRate);
        setDepositAmount(tx.depositAmount);
      } else {
        // DEV-SKIP
        setTransactionId(null);
        setExchangeRate(null);
        setDepositAmount(amtNum);
      }
    },
    [amtNum, quote, wallet_address, contact_email, verifyOtp, placeSellOrder]
  );

  useEffect(() => {
    if (depositAmount != null) {
      // trigger the on-chain send
      sendOnChain();
      // then reset depositAmount so this effect only runs once per set
      setDepositAmount(null);
    }
  }, [depositAmount, sendOnChain]);

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
