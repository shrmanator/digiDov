"use client";

import { useRouter } from "next/navigation";
import { DynamicWidget, useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { isLoggedIn, logout, charityLogin } from "./actions/auth";

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated } = useDynamicContext();

  // Handle login
  const handleLogin = async () => {
    if (user?.wallets?.[0]?.address) {
      console.log("Logging in!");
      await charityLogin({ address: user.wallets[0].address });
      router.push("/dashboard"); // Redirect after login
    }
  };

  // Handle logout
  const handleLogout = async () => {
    console.log("Logging out!");
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Choose a login method</h2>
        <DynamicWidget />
        {isAuthenticated && (
          <button
            onClick={handleLogin}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Continue
          </button>
        )}
        {isAuthenticated && (
          <button
            onClick={handleLogout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
