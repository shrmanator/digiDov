// hooks/useTokenSwap.ts
import { useState, useCallback } from "react";
import {
  useActiveAccount,
  useBuyWithCryptoQuote,
  useBuyWithCryptoStatus,
} from "thirdweb/react";
import { sendTransaction } from "thirdweb";
import { client } from "@/lib/thirdwebClient";

// Map of chain IDs → USDC addresses
const DEFAULT_USDC: Record<number, string> = {
  1: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // Ethereum
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // Polygon
};

export type TokenSwapParams = {
  fromChainId: number;
  fromTokenAddress: string; // use NATIVE_TOKEN_ADDRESS for native
  amount: string; // e.g. "1.5"
  toChainId?: number; // defaults to fromChainId
  toTokenAddress?: string; // defaults to USDC on toChainId
  toAddress?: string; // defaults to your connected wallet
  maxSlippageBPS?: number; // in basis points, defaults to 50
};

export function useTokenSwap({
  fromChainId,
  fromTokenAddress,
  amount,
  toChainId = fromChainId,
  toTokenAddress = DEFAULT_USDC[toChainId],
  toAddress,
  maxSlippageBPS = 50,
}: TokenSwapParams) {
  const account = useActiveAccount();
  const [txHash, setTxHash] = useState<string>();

  // 1) Fetch swap quote (client & fromAddress are auto‑wired)
  const quoteQuery = useBuyWithCryptoQuote(
    account
      ? {
          client,
          fromAddress: account.address,
          fromChainId,
          fromTokenAddress,
          fromAmount: amount,
          toChainId,
          toTokenAddress,
          toAddress: toAddress || account.address,
          maxSlippageBPS,
        }
      : undefined
  );

  // 2) Poll status once we have a txHash (no chainId here)
  const statusQuery = useBuyWithCryptoStatus(
    txHash
      ? {
          client, // required
          transactionHash: txHash, // required
        }
      : undefined
  );

  // 3) Execute approval + swap
  const swap = useCallback(async () => {
    if (!quoteQuery.data || !account) return;
    const { approval, transactionRequest } = quoteQuery.data;

    if (approval) {
      await sendTransaction({ transaction: approval, account });
    }
    const tx = await sendTransaction({
      transaction: transactionRequest,
      account,
    });
    setTxHash(tx.transactionHash);
  }, [quoteQuery.data, account]);

  return {
    quote: quoteQuery.data,
    isLoading: quoteQuery.isLoading,
    swap,
    status: statusQuery.data,
  };
}
