// components/AboutSection.tsx
"use client";

import React from "react";

export default function AboutSection() {
  return (
    <section className="h-screen snap-start flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl text-center">
        <h2 className="text-4xl font-bold mb-4">About Us</h2>
        <p className="text-lg mb-8">
          At digiDov, we believe charitable giving should be simple, secure, and
          effective. Our platform leverages blockchain technology to ensure
          every donation is transparent and impactful. We are committed to
          connecting donors with the causes that matter, fostering a community
          dedicated to lasting change.
        </p>

        {/* Use Cases Section */}
        <div className="text-left">
          <h3 className="text-2xl font-semibold mb-4">Use Cases</h3>

          {/* For Charities */}
          <div className="mb-6">
            <h4 className="text-xl font-medium mb-2">For Charities:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Accept crypto donations without managing wallets or exchanges.
              </li>
              <li>Expand to a new donor base—crypto-native givers.</li>
              <li>
                Stay compliant and issue government-approved receipts
                automatically.
              </li>
              <li>
                Track donations and fund flows via an intuitive dashboard.
              </li>
            </ul>
          </div>

          {/* For Donors */}
          <div className="mb-6">
            <h4 className="text-xl font-medium mb-2">For Donors:</h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>
                Donate ETH or other EVM-chain tokens using their wallet (e.g.,
                MetaMask).
              </li>
              <li>Get instant tax receipts—no follow-up required.</li>
              <li>Support causes they care about using digital assets.</li>
            </ul>
          </div>

          {/* For Regulators / Auditors / Finance Teams */}
          <div>
            <h4 className="text-xl font-medium mb-2">
              For Regulators / Auditors / Finance Teams:
            </h4>
            <ul className="list-disc ml-6 space-y-1">
              <li>Transparent, on-chain donation tracking.</li>
              <li>Receipts include all necessary legal details.</li>
              <li>
                Future features like digiDov Accounting for detailed wallet
                activity reporting.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
