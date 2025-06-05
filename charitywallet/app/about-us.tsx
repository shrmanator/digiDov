"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section className="flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-4 md:mx-0">
        <CardContent className="px-6 md:px-10 py-20 space-y-20">
          {/* Section: About */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">What is digiDov</h2>
            <p className="text-sm md:text-base leading-relaxed">
              digiDov is a non-custodial dApp that lets charities accept crypto
              donations and issue tax receipts. All transactions are processed
              by smart contracts directly on the blockchain—digiDov never holds,
              pools, or touches your funds. Donations are swapped automatically
              via Uniswap, fees are sent transparently, and charities receive
              funds instantly.
            </p>
          </div>

          {/* Section: Nonprofits */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Nonprofit Features</h3>
            <p className="text-sm md:text-base leading-relaxed">
              Funds go straight to your wallet—digiDov has zero access and zero
              custody. You decide when to off-ramp using PayTrie, directly from
              the dashboard. Every donation triggers an automatic, CRA-compliant
              tax receipt for your donor. Track donations and receipts in the
              dashboard.
            </p>
          </div>

          {/* Section: Donor */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Donor Features</h3>
            <p className="text-sm md:text-base leading-relaxed">
              Donate using any EVM-compatible wallet. Your donation is instantly
              processed by a smart contract—no platform custody, ever. Receipts
              are automatically issued after the transaction is confirmed
              on-chain.
            </p>
          </div>

          {/* Section: Fee */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Fee</h3>
            <p className="text-sm md:text-base leading-relaxed">
              A transparent 3% fee is deducted from each donation to cover
              infrastructure and compliance. Fees are sent directly by the
              contract—never held or managed by digiDov.
            </p>
          </div>

          {/* Section: Compliance */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Compliance &amp; Security</h3>
            <p className="text-sm md:text-base leading-relaxed">
              digiDov is fully non-custodial and never handles user funds. All
              donation flows are enforced by open smart contracts. We don&#39;t
              touch private keys or process withdrawals. All swaps and off-ramps
              are managed by regulated third parties, not by digiDov.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
