"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Web3 from "web3";
import { useActiveWalletChain } from "thirdweb/react";
import { useSendWithFee } from "./send-with-fee";

// Mapping from native currency symbols to CoinGecko IDs.
const coinGeckoIdMap: Record<string, string> = {
  ETH: "ethereum",
  POL: "matic-network", // Use the correct CoinGecko ID for "POL"
  // Add more mappings as needed.
};

export default function DonationForm({
  charityWalletAddress,
}: {
  charityWalletAddress: string;
}) {
  // Preset donation amounts in USD.
  const presetAmountsUSD = [10, 20, 50];
  const [selectedAmountUSD, setSelectedAmountUSD] = useState<number | null>(
    null
  );
  const [customAmountUSD, setCustomAmountUSD] = useState<string>("");
  const [usdToNativeRate, setUsdToNativeRate] = useState<number | null>(null);

  const web3 = new Web3();
  const activeChain = useActiveWalletChain();
  // Use fallback values if activeChain is undefined.
  const nativeSymbol = activeChain?.nativeCurrency?.symbol || "ETH";
  const decimals = activeChain?.nativeCurrency?.decimals || 18;

  // Fetch conversion rate from USD to native currency using CoinGecko.
  useEffect(() => {
    async function fetchConversionRate() {
      try {
        const coinId =
          coinGeckoIdMap[nativeSymbol] || nativeSymbol.toLowerCase();
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
        );
        const data = await response.json();
        if (data && data[coinId]?.usd) {
          const usdPrice = data[coinId].usd; // USD per 1 native unit.
          setUsdToNativeRate(1 / usdPrice); // 1 native = (1/usdPrice) native per USD.
        } else {
          console.error("Unexpected data format from CoinGecko:", data);
        }
      } catch (error) {
        console.error("Error fetching conversion rate:", error);
      }
    }
    if (nativeSymbol) {
      fetchConversionRate();
    }
  }, [nativeSymbol]);

  const handlePresetClick = (usdAmount: number) => {
    setSelectedAmountUSD(usdAmount);
    setCustomAmountUSD("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmountUSD(e.target.value);
    setSelectedAmountUSD(null);
  };

  // Convert the chosen USD amount to the native currency amount (in wei).
  const donationAmountInNative = (() => {
    if (!usdToNativeRate) return null;
    const usdAmount =
      selectedAmountUSD !== null
        ? selectedAmountUSD
        : parseFloat(customAmountUSD);
    if (!usdAmount || usdAmount <= 0) return null;
    const nativeAmount = usdAmount * usdToNativeRate;
    if (decimals === 18) {
      return BigInt(web3.utils.toWei(nativeAmount.toString(), "ether"));
    } else {
      return BigInt(Math.floor(nativeAmount * Math.pow(10, decimals)));
    }
  })();

  // Call useSendWithFee unconditionally with a fallback donation amount of 0.
  const sendWithFee = useSendWithFee(
    donationAmountInNative ?? BigInt(0),
    charityWalletAddress
  );

  return (
    <Card className="max-w-md mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Choose a Donation Amount
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!usdToNativeRate ? (
          <p>Loading conversion rate...</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {presetAmountsUSD.map((usdAmount) => {
              // Convert preset USD amount to native for display.
              const nativeAmountDisplay = (usdAmount * usdToNativeRate).toFixed(
                6
              );
              return (
                <Button
                  key={usdAmount}
                  variant={
                    selectedAmountUSD === usdAmount ? "default" : "outline"
                  }
                  onClick={() => handlePresetClick(usdAmount)}
                  className="flex-1"
                >
                  {nativeAmountDisplay} {nativeSymbol} (~${usdAmount})
                </Button>
              );
            })}
            <Input
              type="number"
              placeholder={`Custom (USD)`}
              value={customAmountUSD}
              onChange={handleCustomChange}
              className="w-24"
            />
          </div>
        )}
        {donationAmountInNative ? (
          <Button
            onClick={sendWithFee.onClick}
            disabled={sendWithFee.isPending}
          >
            {sendWithFee.isPending
              ? "Processing..."
              : sendWithFee.transactionResult
              ? "Transaction Sent"
              : "Send With Fee"}
          </Button>
        ) : (
          <Button disabled>Please enter a valid donation amount</Button>
        )}
      </CardContent>
    </Card>
  );
}
