"use client";

import { useEffect } from "react";
import { initializeMoralis } from "./moralis";

export default function MoralisInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initializeMoralis();
  }, []);

  return <>{children}</>;
}
