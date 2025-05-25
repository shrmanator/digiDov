import { useState, useCallback } from "react";
import { useLogin } from "@/hooks/use-thirdweb-headless-login";
import { useSendWithFee } from "@/hooks/use-send-with-fee";

type UseDonateResult = {
  onDonate: () => Promise<void>;
  isSending: boolean;
  txResult: any;
  error: Error | null;
};

/**
 * Full “connect → sign → send” donation flow.
 *
 * @param amountWei  ETH amount (in wei) the user wants to donate
 * @param to         Charity recipient address
 */
export function useDonate(amountWei: bigint, to: string): UseDonateResult {
  const { account, login } = useLogin();
  const [error, setError] = useState<Error | null>(null);

  const {
    onClick: sendWithFee,
    isPending,
    transactionResult,
  } = useSendWithFee(amountWei, to);

  const onDonate = useCallback(async () => {
    try {
      setError(null);

      // 1 · Make sure the wallet is connected
      if (!account) {
        await login();
      }

      // 2 · Trigger the donation transaction
      sendWithFee();
    } catch (e) {
      setError(e as Error);
    }
  }, [account, login, sendWithFee]);

  return {
    onDonate,
    isSending: isPending,
    txResult: transactionResult,
    error,
  };
}
