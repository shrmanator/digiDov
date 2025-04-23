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
 * Encapsulates the full "connect → sign → send" flow.
 * @param amountWei - Amount to send in wei.
 * @param to - Recipient address.
 */
export function useDonate(amountWei: bigint, to: string): UseDonateResult {
  const { account, login } = useLogin();
  const [error, setError] = useState<Error | null>(null);

  // Wrap the existing send-with-fee hook
  const {
    onClick: sendWithFee,
    isPending,
    transactionResult,
  } = useSendWithFee(amountWei, to);

  const onDonate = useCallback(async () => {
    try {
      setError(null);
      // Ensure wallet is connected
      if (!account) {
        await login();
      }
      // Trigger the send flow
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
