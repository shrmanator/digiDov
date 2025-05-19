import { useState, useCallback } from "react";
import { usePayTrieAuth } from "./use-paytrie-auth";
import { usePayTrieQuote } from "./use-paytrie-quotes";
import { usePaytrieSellOrder } from "./use-paytrie-sell-order";
import { buildPaytrieSellOrderPayload } from "@/utils/paytrie/build-paytrie-transaction-payload";
import { useSendTransaction } from "thirdweb/react";
import { getContract } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { client } from "@/lib/thirdwebClient";
import { polygon } from "thirdweb/chains";
import { toast } from "@/hooks/use-toast";

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

  // get the async mutate
  const { mutateAsync: sendTxAsync, isPending: isSendingOnChain } =
    useSendTransaction();

  const initiateWithdraw = useCallback(async () => {
    if (!quote || apiLoading || amtNum <= 0) return;
    await sendOtp();
  }, [quote, apiLoading, amtNum, sendOtp]);

  const confirmOtp = useCallback(
    async (code: string) => {
      // 1) Verify OTP
      const token = await verifyOtp(code);

      // 2) Place sell order on our back end
      const payload = buildPaytrieSellOrderPayload(
        amtNum,
        quote!,
        wallet_address,
        contact_email
      );
      const txResult = await placeSellOrder(payload, token);

      setTransactionId(txResult.transactionId);
      setExchangeRate(txResult.exchangeRate);

      // 3) Build the on-chain transfer with the exact depositAmount
      const depositAmount = txResult.depositAmount.toString();
      const contract = getContract({
        address: process.env.NEXT_PUBLIC_POLYGON_USDC_ADDRESS!,
        chain: polygon,
        client,
      });
      const tx = transfer({
        contract,
        to: process.env.NEXT_PUBLIC_PAYTRIE_DEPOSIT_ADDRESS!,
        amount: depositAmount,
      });

      console.log("📡 broadcasting on-chain transfer of", depositAmount);

      // 4) Await the on-chain send, and only after success show toast
      await sendTxAsync(tx);
      toast({
        title: "Token Sent",
        description: `Sent ${depositAmount} USDC on‐chain`,
      });
    },
    [
      amtNum,
      quote,
      wallet_address,
      contact_email,
      verifyOtp,
      placeSellOrder,
      sendTxAsync,
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
