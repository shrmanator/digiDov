import { useEffect, useState, useMemo, useCallback } from "react";
import Web3 from "web3";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";
import { useAuth } from "@/contexts/auth-context";
import { useLogin } from "@/hooks/use-thirdweb-headless-login";
import { useConversionRate } from "@/hooks/use-current-conversion-rate";
import { useDonationCalculator } from "@/hooks/use-donation-calculator";
import { useSendWithFee } from "@/hooks/use-send-with-fee";
import type { charity } from "@prisma/client";

const PRESET_USD_AMOUNTS = [10, 20, 50];
const FEE_PERCENTAGE = 0.03;

export function useDonationForm(charity: charity) {
  const { donor } = useAuth();
  const { account, login } = useLogin();
  const activeAccount = useActiveAccount();
  const walletAddress = activeAccount?.address;
  const activeChain = useActiveWalletChain();

  const chainId = useMemo(
    () => String(activeChain?.id ?? 1),
    [activeChain?.id]
  );
  const nativeSymbol = activeChain?.nativeCurrency?.symbol ?? "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals ?? 18;

  const {
    conversionRate,
    isLoading: rateLoading,
    isError,
    error,
  } = useConversionRate(chainId, "usd");

  // UI state
  const [selectedUSD, setSelectedUSD] = useState<number | null>(null);
  const [customUSD, setCustomUSD] = useState("");
  const [coverFee, setCoverFee] = useState(true);
  const [donationSuccess, setDonationSuccess] = useState(false);

  const web3 = useMemo(() => new Web3(), []);

  const { donationAmountWei, tokenFloat, charityReceives, totalPaid } =
    useDonationCalculator({
      tokenPrice,
      selectedUSD,
      customUSD,
      decimals,
      web3,
      coverFee,
      feePercentage: FEE_PERCENTAGE,
    });

  const { onClick, isPending, transactionResult } = useSendWithFee(
    donationAmountWei ?? BigInt(0),
    charity.wallet_address
  );

  // Effects
  useEffect(() => {
    if (conversionError) console.error("Conversion error:", conversionError);
  }, [conversionError]);

  useEffect(() => {
    if (transactionResult) {
      setDonationSuccess(true);
      const timer = setTimeout(() => {
        setDonationSuccess(false);
        setSelectedUSD(null);
        setCustomUSD("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transactionResult]);

  // Handlers
  const handlePresetClick = useCallback((usd: number) => {
    setSelectedUSD(usd);
    setCustomUSD("");
  }, []);
  const handleCustomChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCustomUSD(e.target.value);
      setSelectedUSD(null);
    },
    []
  );
  const handleDonate = useCallback(async () => {
    if (!account) {
      await login();
      return;
    }
    onClick();
  }, [account, login, onClick]);

  // Derived UI props
  const loading = tokenPrice === null;
  const selectorProps = {
    presetAmounts: PRESET_USD_AMOUNTS,
    selectedAmount: selectedUSD,
    customAmount: customUSD,
    onPresetClick: handlePresetClick,
    onCustomChange: handleCustomChange,
    tokenPrice: tokenPrice ?? 0,
    nativeSymbol,
    tokenFloat,
  };
  const inlineSummary = !loading && charityReceives > 0;
  const buttonLabel = isPending
    ? "Processing..."
    : donationSuccess
    ? "Donation Sent!"
    : `Donate${tokenFloat > 0 ? ` $${totalPaid.toFixed(2)}` : ""}`;
  const isButtonDisabled = !donationAmountWei || isPending;

  return {
    donor: donor && { ...donor, walletAddress },
    isProfileIncomplete:
      !!donor && !!walletAddress && !donor.is_profile_complete,
    nativeSymbol,
    tokenPrice,
    loading,
    selectorProps,
    inlineSummary,
    buttonLabel,
    isButtonDisabled,
    isPending,
    donationSuccess,
    handleDonate,
    totalPaid,
    charityReceives,
    tokenFloat,
  };
}
