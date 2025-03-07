import { useMemo } from "react";
import Web3 from "web3";

interface DonationCalculatorProps {
  tokenPrice: number | null;
  selectedUSD: number | null;
  customUSD: string;
  decimals: number;
  web3: Web3;
  coverFee: boolean;
  feePercentage: number;
}

interface DonationCalculation {
  donationAmountWei: bigint | null;
  tokenFloat: number;
  charityReceives: number;
  feeAmount: number;
  totalPaid: number;
}

export function useDonationCalculator({
  tokenPrice,
  selectedUSD,
  customUSD,
  decimals,
  web3,
  coverFee,
  feePercentage,
}: DonationCalculatorProps): DonationCalculation {
  return useMemo(() => {
    if (!tokenPrice) {
      return {
        donationAmountWei: null,
        tokenFloat: 0,
        charityReceives: 0,
        feeAmount: 0,
        totalPaid: 0,
      };
    }

    const usdValue =
      selectedUSD !== null ? selectedUSD : parseFloat(customUSD || "0");

    if (usdValue <= 0) {
      return {
        donationAmountWei: null,
        tokenFloat: 0,
        charityReceives: 0,
        feeAmount: 0,
        totalPaid: 0,
      };
    }

    let fee = usdValue * feePercentage;
    let charityAmount, total;

    if (coverFee) {
      // User covers the fee (fee added on top)
      charityAmount = usdValue;
      total = usdValue + fee;
    } else {
      // Fee subtracted from donation
      charityAmount = usdValue - fee;
      total = usdValue;
    }

    // Calculate token amount based on charity's receiving amount
    const tokenAmount = charityAmount / tokenPrice;
    const amountWei =
      decimals === 18
        ? BigInt(web3.utils.toWei(tokenAmount.toFixed(18), "ether"))
        : BigInt(Math.floor(tokenAmount * 10 ** decimals));

    return {
      donationAmountWei: amountWei,
      tokenFloat: tokenAmount,
      charityReceives: charityAmount,
      feeAmount: fee,
      totalPaid: total,
    };
  }, [
    tokenPrice,
    selectedUSD,
    customUSD,
    decimals,
    web3,
    coverFee,
    feePercentage,
  ]);
}
