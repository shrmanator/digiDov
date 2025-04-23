import { getTxExplorerLink } from "@/utils/get-tx-explorer-link";
import React from "react";

interface ExplorerLinkProps {
  txHash: string;
}

/**
 * Renders a link to view a transaction on Blockscan (multi-chain explorer).
 */
export const ExplorerLink: React.FC<ExplorerLinkProps> = ({ txHash }) => {
  const url = getTxExplorerLink(txHash);
  if (!url) return null;

  return (
    <div className="w-full text-center mb-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm underline text-primary"
      >
        View transaction on Blockscan
      </a>
    </div>
  );
};
