import { useState, useCallback } from "react";
import { useLogin } from "@/hooks/use-thirdweb-headless-login";
import { useSendWithFee } from "@/hooks/use-send-with-fee";

type UseDonateResult = {
  onDonate: () => Promise<void>;
  isSending: boolean;
  didSucceed: boolean;
  error: Error | null;
};

export function useDonate(amountWei: bigint, to: string): UseDonateResult {
  const { account, login } = useLogin();
  const [error, setError] = useState<Error | null>(null);

  // pull out the new shape of send-with-fee
  const { onClick: sendWithFee, status } = useSendWithFee(amountWei, to);

  const onDonate = useCallback(async () => {
    try {
      setError(null);
      if (!account) {
        await login();
      }
      await sendWithFee();
    } catch (e) {
      setError(e as Error);
    }
  }, [account, login, sendWithFee]);

  return {
    onDonate,
    isSending: status === "approving" || status === "donating",
    didSucceed: status === "success",
    error,
  };
}
