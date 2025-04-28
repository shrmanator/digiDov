import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DonationHistory from "./transaction-history-via-db";
import { DonationReceipt } from "../app/types/receipt";

describe("DonationHistory Component", () => {
  beforeAll(() => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("renders empty state with donationLink and copy interaction", async () => {
    const mockLink = "https://donate.example.com";
    render(<DonationHistory receipts={[]} donationLink={mockLink} />);

    // Empty state message
    expect(screen.getByText("No donation receipts found.")).toBeInTheDocument();

    // Link prompt
    expect(
      screen.getByText("Share this donation link to start accepting donations:")
    ).toBeInTheDocument();

    // Link container is clickable
    const linkContainer = screen.getByText(mockLink).closest("div");
    expect(linkContainer).toHaveClass("cursor-pointer");

    // Click and clipboard write
    fireEvent.click(linkContainer!);
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockLink);
    });

    // Tooltip updates to 'Link copied!'
    expect(screen.getByText("Link copied!")).toBeInTheDocument();
  });

  it("does not show empty state when receipts are present", () => {
    const sample: DonationReceipt = {
      id: "1",
      receipt_number: "001",
      donation_date: new Date().toISOString(),
      fiat_amount: 42,
      transaction_hash: "0xtxhash",
      chainId: "0x1",
      donor: {
        first_name: "Alice",
        last_name: "Smith",
        email: "alice@example.com",
      },
      charity: { charity_name: "Test Charity", registration_number: null },
    };

    render(<DonationHistory receipts={[sample]} donationLink="unused" />);

    // Should not show empty-state text
    expect(screen.queryByText("No donation receipts found.")).toBeNull();
    expect(
      screen.queryByText(
        "Share this donation link to start accepting donations:"
      )
    ).toBeNull();

    // Should show receipt details
    expect(screen.getByText("$42.00")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();

    expect(screen.getByText("Ethereum")).toBeInTheDocument();
  });

  it("handles anonymous donor and unknown chain edge cases", () => {
    const edge: DonationReceipt = {
      id: "2",
      receipt_number: "002",
      donation_date: new Date(Date.now() - 90 * 1000).toISOString(), // 90 seconds ago
      fiat_amount: 10,
      transaction_hash: "0xabcdef",
      chainId: "0x9999", // not in CHAIN_MAP
      donor: null,
      charity: { charity_name: "Edge Charity", registration_number: null },
    };

    render(<DonationHistory receipts={[edge]} />);

    // Anonymous donor
    expect(screen.getByText("Anonymous Donor")).toBeInTheDocument();

    // Unknown chain badge
    expect(screen.getByText("Unknown Chain")).toBeInTheDocument();

    // Relative time shows minutes
    expect(screen.getByText(/minute ago|minutes ago/)).toBeInTheDocument();
  });

  it("shows just now for very recent donations (<1 minute)", () => {
    const nowReceipt: DonationReceipt = {
      id: "3",
      receipt_number: "003",
      donation_date: new Date().toISOString(),
      fiat_amount: 5,
      transaction_hash: "0xnow",
      chainId: "0x1",
      donor: null,
      charity: null,
    };

    render(<DonationHistory receipts={[nowReceipt]} />);

    expect(screen.getByText("just now")).toBeInTheDocument();
  });
});
