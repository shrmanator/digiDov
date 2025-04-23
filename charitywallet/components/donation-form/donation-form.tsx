"use client";

import React, { useState } from "react";
import type { ReactElement } from "react";
import { DonationSuccess } from "./donation-success";

/**
 * A standalone page for previewing and adjusting the DonationSuccess component.
 */
export default function DonationSuccessPage(): ReactElement {
  // Sample props state to allow live preview
  const [visible, setVisible] = useState(true);

  const handleReset = () => {
    // Toggle visibility to re-render the component
    setVisible(false);
    setTimeout(() => setVisible(true), 100);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {visible && (
        <DonationSuccess
          txHash="0x1234abcd5678ef901234abcd5678ef901234abcd5678ef901234abcd5678ef90"
          onReset={handleReset}
        />
      )}
    </main>
  );
}
