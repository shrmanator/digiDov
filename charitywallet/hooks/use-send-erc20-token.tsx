import { useCallback, useState } from "react";
import { getContract } from "thirdweb";
import { transfer } from "thirdweb/extensions/erc20";
import { sendTransaction } from "thirdweb";
import { useActiveAccount, useWalletBalance } from "thirdweb/react";
import { polygon } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import { toast } from "@/hooks/use-toast";
import type { Chain } from "thirdweb/chains";

interface SendErc20Callbacks {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Hook to send ERC-20 tokens via ThirdWeb, with gas balance check using useWalletBalance.
 * Returns onClick, isPending, and native POL balance.
 */
export function useSendErc20Token(
  amount: string,
  recipientAddress: string,
  contractAddress: string,
  chain: Chain = polygon,
  callbacks?: SendErc20Callbacks
) {
  const [isPending, setIsPending] = useState(false);

  // Get the active connected wallet account
  const activeAccount = useActiveAccount();

  // Fetch native POL (MATIC) balance via Thirdweb hook
  const {
    data: balanceData,
    isLoading: balanceLoading,
    isError: balanceError,
  } = useWalletBalance({
    chain,
    address: activeAccount?.address,
    client,
  });
  const polBalance = balanceData?.displayValue || null;
  console.log(
    "useSendErc20Token: POL balance",
    polBalance,
    balanceData?.symbol
  );

  // Initialize contract reference for USDC
  const contract = getContract({ address: contractAddress, chain, client });

  const onClick = useCallback(async () => {
    if (!activeAccount?.address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your account.",
        variant: "destructive",
      });
      return;
    }

    // Ensure we have enough POL for gas (0.01 POL)
    if (!balanceData || balanceLoading || balanceError) {
      toast({
        title: "Balance unavailable",
        description: "Could not fetch POL balance.",
        variant: "destructive",
      });
      return;
    }
    const minGas = 0.01;
    const current = parseFloat(polBalance!);
    if (current < minGas) {
      toast({
        title: "Insufficient POL",
        description: `You need at least ${minGas} POL to cover gas fees.`,
        variant: "destructive",
      });
      return;
    }

    setIsPending(true);
    try {
      // Prepare ERC20 transfer transaction (extension handles decimals)
      console.log("useSendErc20Token: preparing transaction", amount);
      const preparedTx = transfer({ contract, to: recipientAddress, amount });
      console.log("useSendErc20Token: prepared transaction", preparedTx);
      // Send the transaction from the active account
      const result = await sendTransaction({
        transaction: preparedTx,
        account: activeAccount,
      });
      console.log("useSendErc20Token: transaction result", result);

      toast({
        title: "Token Sent",
        description: `Sent ${amount} USDC to ${recipientAddress}`,
      });
      callbacks?.onSuccess?.();
    } catch (error: any) {
      console.error("useSendErc20Token: transaction failed", error);
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      });
      callbacks?.onError?.(error);
    } finally {
      setIsPending(false);
    }
  }, [
    amount,
    recipientAddress,
    contract,
    activeAccount,
    polBalance,
    balanceLoading,
    balanceError,
    callbacks,
  ]);

  return { onClick, isPending, polBalance, balanceLoading, balanceError };
}
