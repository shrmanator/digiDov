"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function AboutSection() {
  return (
    <section className="flex items-center justify-center">
      <Card className="w-full max-w-4xl mx-4 md:mx-0 bg-zinc-900">
        <CardContent className="px-6 md:px-10 py-20 space-y-20">
          {/* Section: About */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">What is digiDov</h2>
            <p className="text-sm md:text-base leading-relaxed">
              digiDov simplifies crypto fundraising. Nonprofits can create a
              wallet or connect an existing one, then place the provided
              donation link on their website. The setup takes minutes. Donations
              are currently supported on Ethereum and Polygon, with more
              networks on the way.
            </p>
          </div>

          {/* Section: Nonprofits */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Nonprofits</h3>
            <p className="text-sm md:text-base leading-relaxed">
              All funds go directly to your wallet. digiDov has no access and no
              custody. You choose when and how to use the funds. Every donation
              triggers an automatic, CRA-compliant tax receipt sent right to
              your donor. A live dashboard gives you visibility into donations
              and transaction history.
            </p>
          </div>

          {/* Section: Donor */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Donor</h3>
            <p className="text-sm md:text-base leading-relaxed">
              Donors can give using any EVM-compatible wallet. Receipts are
              automatically issued once the donation transaction is confirmed on
              the blockchain.
            </p>
          </div>

          {/* Section: Fee */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Fee</h3>
            <p className="text-sm md:text-base leading-relaxed">
              A 3% fee is automatically deducted from each donation. This covers
              infrastructure and regulatory compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
