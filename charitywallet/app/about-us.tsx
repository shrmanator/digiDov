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
              digiDov is a dApp that lets charities accept crypto donations and
              issue tax receipts. It supports EVM-compatible chains and charges
              a 3% fee on donations. The platform provides an easy way for
              charities to handle crypto without managing custody or
              infrastructure. Donors get instant CRA-compliant tax receipts, and
              charities get funds directly.
            </p>
          </div>

          {/* Section: Nonprofits */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Nonprofit Features</h3>
            <p className="text-sm md:text-base leading-relaxed">
              All funds go directly to your wallet. digiDov has no access and no
              custody. You choose when and how to use the funds. Every donation
              triggers an automatic, CRA-compliant tax receipt sent right to
              your donor. A live dashboard gives you visibility into donations,
              tax receipts, and transaction history.
            </p>
          </div>

          {/* Section: Donor */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Donor Features</h3>
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
