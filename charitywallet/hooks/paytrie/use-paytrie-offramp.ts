import { useState, useCallback, useEffect } from "react";
import { usePayTrieAuth } from "./use-paytrie-auth";
import { usePayTrieQuote } from "./use-paytrie-quotes";
import { usePaytrieSellOrder } from "./use-paytrie-sell-order";
import { buildPaytrieSellOrderPayload } from "@/utils/paytrie/build-paytrie-transaction-payload";
import { useSendErc20Token } from "@/hooks/use-send-erc20-token";
import { ethereum, polygon } from "thirdweb/chains";

export function usePayTrieOfframp(
  wallet_address: string,
  contact_email: string
) {
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [exchangeRate, setExchangeRate] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("");

  const amtNum = parseFloat(amount) || 0;
  const { sendOtp, verifyOtp } = usePayTrieAuth(contact_email);
  const {
    quote,
    isLoading: quoteLoading,
    error: quoteError,
  } = usePayTrieQuote(amtNum);
  const { placeSellOrder, isSubmitting: apiLoading } = usePaytrieSellOrder();

  // prepare ERC20 sender using external hook
  const { onClick: sendErc20, isPending: isSendingOnChain } = useSendErc20Token(
    depositAmount,
    "0x4ce18aaB797Dfe451823492c06bd7a8c09A72874",
    process.env.NEXT_PUBLIC_POLYGON_USDC_ADDRESS!,
    ethereum
  );

  const initiateWithdraw = useCallback(async () => {
    if (!quote || apiLoading || amtNum <= 0) return;
    await sendOtp();
  }, [quote, apiLoading, amtNum, sendOtp]);

  const confirmOtp = useCallback(
    async (code: string) => {
      console.log("confirmOtp: verifying OTP with code", code);
      const token = await verifyOtp(code);

      console.log("confirmOtp: placing sell order for amount", amtNum);
      const payload = buildPaytrieSellOrderPayload(
        amtNum,
        quote!,
        wallet_address,
        contact_email
      );
      const txResult = await placeSellOrder(payload, token);

      console.log("confirmOtp: received sellOrder result", txResult);
      setTransactionId(txResult.transactionId);
      setExchangeRate(txResult.exchangeRate);

      // trigger on-chain transfer
      const amtStr = txResult.depositAmount.toString();
      console.log("confirmOtp: setting depositAmount to", amtStr);
      setDepositAmount(amtStr);
    },
    [amtNum, quote, wallet_address, contact_email, verifyOtp, placeSellOrder]
  );

  // watch for depositAmount to trigger on-chain send
  useEffect(() => {
    console.log("useEffect: depositAmount changed to", depositAmount);
    if (!depositAmount) return;
    console.log(
      "useEffect: calling sendErc20 for depositAmount",
      depositAmount
    );
    sendErc20();
    // clear to avoid rerun
    setDepositAmount("");
  }, [depositAmount, sendErc20]);

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
