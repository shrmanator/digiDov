"use client";

export default function AboutSection() {
  return (
    <section className="h-screen snap-start bg-black text-white flex items-center justify-center">
      <div className="max-w-4xl w-full px-6 md:px-10 py-20 space-y-20">
        {/* Section: About */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold">About digiDov</h2>
          <p className="text-base md:text-lg text-neutral-300 leading-relaxed">
            digiDov makes crypto donations simple, transparent, and compliant.
            Donors get instant receipts. Charities get a dashboard and
            auto-tracking.
          </p>
        </div>

        {/* Section: Charities & DAFs */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold">Charities & DAFs</h3>
          <p className="text-base md:text-lg text-neutral-300 leading-relaxed">
            Accept crypto donations without needing to set up a wallet or manage
            exchanges. Attract crypto-native donors with ease. digiDov
            auto-issues CRA-compliant receipts and provides a live dashboard for
            tracking donations and fund flows. Organizations can embed a
            donation button with no development work, choose to use their own
            wallet or have digiDov manage it, and access real-time insights — no
            crypto expertise required.
          </p>
        </div>

        {/* Section: Donors */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold">Donors</h3>
          <p className="text-base md:text-lg text-neutral-300 leading-relaxed">
            Donate easily using any EVM-compatible wallet. Receive instant tax
            receipts and support causes you care about using your digital
            assets. The process is fast, secure, and streamlined for a seamless
            giving experience.
          </p>
        </div>

        {/* Section: Auditors */}
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold">Auditors</h3>
          <p className="text-base md:text-lg text-neutral-300 leading-relaxed">
            All donations are recorded on-chain for transparency. Receipts
            include full legal details, making audits simpler and more reliable.
            digiDov Accounting (coming soon) will offer comprehensive compliance
            reports tailored for professional oversight.
          </p>
        </div>
      </div>
    </section>
  );
}
