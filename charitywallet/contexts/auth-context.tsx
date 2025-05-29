"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useActiveAccount } from "thirdweb/react";
import { getDonorByWallet } from "@/app/actions/donors";
import type { VerifyLoginPayloadParams } from "thirdweb/auth";
import {
  donorLogin as loginDonorServer,
  charityLogin as loginCharityServer,
  logout as logoutServer,
} from "@/app/actions/auth";

interface AuthContextProps {
  user: { walletAddress: string; role?: "donor" | "charity" } | null;
  donor: any | null;
  loginDonor: (params: VerifyLoginPayloadParams) => Promise<void>;
  loginCharity: (params: VerifyLoginPayloadParams) => Promise<void>;
  logout: () => Promise<void>;
  updateDonor: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<
    { walletAddress: string; role?: "donor" | "charity" } | null
  >(null);
  const [donor, setDonor] = useState<any | null>(null);
  const activeAccount = useActiveAccount();

  // When the active wallet changes (e.g. on auto-connect), update user state and fetch donor info.
  useEffect(() => {
    if (activeAccount?.address) {
      const walletAddress = activeAccount.address.toLowerCase();
      setUser({ walletAddress });
      getDonorByWallet(walletAddress)
        .then((donorData) => setDonor(donorData))
        .catch((error) => console.error("Failed to fetch donor info", error));
    } else {
      setUser(null);
      setDonor(null);
    }
  }, [activeAccount]);

  // Donor login function – calls your donorLogin server action then updates context.
  const loginDonor = async (params: VerifyLoginPayloadParams) => {
    const walletAddress = params.payload.address.toLowerCase();
    await loginDonorServer(params);
    setUser({ walletAddress, role: "donor" });
    const updatedDonor = await getDonorByWallet(walletAddress);
    setDonor(updatedDonor);
  };

  // Charity login function – calls your charityLogin server action then updates context.
  const loginCharity = async (params: VerifyLoginPayloadParams) => {
    const walletAddress = params.payload.address.toLowerCase();
    await loginCharityServer(params);
    setUser({ walletAddress, role: "charity" });
    // UPDATE CHARITY SPECIFIC STATE HERE
  };

  const logout = async () => {
    await logoutServer();
    setUser(null);
    setDonor(null);
  };

  const updateDonor = async (walletAddress: string) => {
    const updatedDonor = await getDonorByWallet(walletAddress);
    setDonor(updatedDonor);
  };

  return (
    <AuthContext.Provider
      value={{ user, donor, loginDonor, loginCharity, logout, updateDonor }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
