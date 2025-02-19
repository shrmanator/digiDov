"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import ConnectWalletButton from "@/components/connect-wallet-button";

export default function ClientDonate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const account = useActiveAccount();

  useEffect(() => {
    if (account && account.address) {
      setIsAuthenticated(true);
    }
  }, [account]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md flex flex-col items-center">
        {!isAuthenticated ? (
          <ConnectWalletButton setIsAuthenticated={setIsAuthenticated} />
        ) : account && account.address ? (
          <div>
            <h2>Welcome, {account.address}</h2>
            {/* Render your donation form and donor info here */}
          </div>
        ) : (
          <p>Loading account information...</p>
        )}
      </div>
    </div>
  );
}
