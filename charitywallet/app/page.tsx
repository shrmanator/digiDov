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

import { Card, CardContent } from "@/components/ui/card";
import { Typewriter } from "react-simple-typewriter";

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

  const bannerText = `Open yourself to CRA-compliant crypto donations!`;

  return (
    <div className="overflow-y-auto">
      {/* Login / Connect Section */}
      <section className="flex flex-col items-center justify-center p-8">
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
          <p className="mb-6 ml-28 text-xs font-tsukimi text-gray-300">
            Crypto Donations, Simplified
          </p>

          {/* Banner with react-simple-typewriter */}
          <Card className="w-full mb-6">
            <CardContent className="py-4 px-6">
              <span className="text-sm sm:text-base text-center">
                <Typewriter
                  words={[bannerText]}
                  loop={1}
                  cursor
                  cursorStyle="|"
                  typeSpeed={40}
                  deleteSpeed={0}
                  delaySpeed={2000}
                />
              </span>
            </CardContent>
          </Card>

          <ConnectEmbed
            client={client}
            wallets={wallets}
            chain={ethereum}
            header={{ title: " " }}
            showThirdwebBranding={false}
            auth={{
              isLoggedIn: async () => await isLoggedIn(),
              doLogin: async (params) => {
                const email = await getUserEmail({ client });
                const txWallet = activeAccount?.address;
                const enrichedParams = {
                  ...params,
                  context: { email, txWallet },
                };
                await charityLogin(enrichedParams);
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
      <section className="mt-20 mb-20">
        <AboutSection />
      </section>
    </div>
  );
}
