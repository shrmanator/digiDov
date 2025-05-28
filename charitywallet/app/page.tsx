"use client";

import { useRouter } from "next/navigation";
import { ConnectEmbed, useActiveAccount } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ethereum } from "thirdweb/chains";
import { client } from "@/lib/thirdwebClient";
import Image from "next/image";
import {
  isLoggedIn,
  generatePayload,
  logout,
  charityLogin,
} from "./actions/auth";
import AboutSection from "./about-us";
import { getUserEmail } from "thirdweb/wallets/in-app";

export default function Home() {
  const router = useRouter();
  const activeAccount = useActiveAccount();

  const wallets = [
    inAppWallet({
      auth: { options: ["google", "email"] },
      executionMode: {
        mode: "EIP7702",
        sponsorGas: false,
      },
    }),
    createWallet("io.metamask"),
    createWallet("app.phantom"),
    createWallet("com.zengo"),
  ];

  return (
    <div className="overflow-y-auto">
      {/* Login / Connect Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md flex flex-col items-center">
          <div className="flex items-center">
            <Image
              src="/images/dovcoin-logo.png"
              alt="Dovcoin Logo"
              width={90}
              height={90}
              className="mr-4"
              quality={100}
            />
            <h1 className="text-5xl ml-2 text-orange-600 font-tsukimi font-bold">
              digiDov
            </h1>
          </div>
          <p className="mb-6 ml-28 text-center text-xs font-tsukimi">
            Crypto Donations, Simplified
          </p>
          <ConnectEmbed
            client={client}
            wallets={wallets}
            header={{ title: " " }}
            showThirdwebBranding={false}
            auth={{
              isLoggedIn: async () => await isLoggedIn(),
              doLogin: async (params) => {
                // 1. fetch OAuth email from in-app wallet session
                const email = await getUserEmail({ client });

                // 2. fetch active transaction wallet
                const txWallet = activeAccount?.address;

                // 3. attach email and txWallet to login payload
                const enrichedParams = {
                  ...params,
                  context: { email, txWallet },
                };

                // 4. call server action with enriched payload
                await charityLogin(enrichedParams);

                // 5. navigate to dashboard
                router.push("/dashboard/overview");
              },
              getLoginPayload: async ({ address }) =>
                generatePayload({
                  address: address.toLowerCase(),
                  chainId: ethereum.id,
                }),
              doLogout: async () => {
                await logout();
              },
            }}
          />
          <p className="text-xs text-gray-500 mt-4">
            🔒 Your data remains private and secure.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="mt-[-20] mb-20">
        <AboutSection />
      </section>
    </div>
  );
}
