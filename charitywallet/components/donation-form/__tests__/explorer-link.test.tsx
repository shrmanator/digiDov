import React from "react";
import { render, screen } from "@testing-library/react";
import { ExplorerLink } from "@/components/donation-form/explorer-link";

describe("ExplorerLink", () => {
  it("renders nothing when no txHash is provided", () => {
    const { container } = render(<ExplorerLink txHash="" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a link with correct href when txHash is provided", () => {
    const txHash = "0xABC123";
    render(<ExplorerLink txHash={txHash} />);
    const link = screen.getByRole("link", {
      name: /view transaction on blockscan/i,
    });
    expect(link).toHaveAttribute("href", `https://blockscan.com/tx/${txHash}`);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveTextContent(/view transaction on blockscan/i);
  });
});
