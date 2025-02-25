"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getDonorByWallet } from "@/app/actions/donors";
import {
  donorLogin as donorLoginAPI,
  logout as logoutAPI,
} from "@/app/actions/auth";
import type { VerifyLoginPayloadParams } from "thirdweb/auth";

interface AuthContextProps {
  user: { walletAddress: string } | null;
  donor: any | null;
  login: (params: VerifyLoginPayloadParams) => Promise<void>;
  logout: () => Promise<void>;
  updateDonor: (walletAddress: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ walletAddress: string } | null>(null);
  const [donor, setDonor] = useState<any | null>(null);
  const activeAccount = useActiveAccount();

  // Update context state when active account changes
  useEffect(() => {
    if (activeAccount?.address) {
      const walletAddress = activeAccount.address.toLowerCase();
      setUser({ walletAddress });
      // Fetch donor info (you might want to add error handling)
      getDonorByWallet(walletAddress)
        .then((donorData) => setDonor(donorData))
        .catch((error) => console.error("Failed to fetch donor", error));
    } else {
      setUser(null);
      setDonor(null);
    }
  }, [activeAccount]);

  const login = async (params: VerifyLoginPayloadParams) => {
    const walletAddress = params.payload.address.toLowerCase();
    await donorLoginAPI(params);
    setUser({ walletAddress });
    const updatedDonor = await getDonorByWallet(walletAddress);
    setDonor(updatedDonor);
  };

  const logout = async () => {
    await logoutAPI();
    setUser(null);
    setDonor(null);
  };

  const updateDonor = async (walletAddress: string) => {
    const updatedDonor = await getDonorByWallet(walletAddress);
    setDonor(updatedDonor);
  };

  return (
    <AuthContext.Provider value={{ user, donor, login, logout, updateDonor }}>
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
