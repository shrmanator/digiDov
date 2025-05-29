// src/components/__tests__/donation-success.test.tsx

import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { DonationSuccess } from "../donation-success";
import { getTxExplorerLink } from "@/utils/get-tx-explorer-link";

// Mock the entire module
jest.mock("@/utils/get-tx-explorer-link", () => ({
  getTxExplorerLink: jest.fn(),
}));

// Type-assert the mock for convenience
const mockedGetTxExplorerLink = getTxExplorerLink as jest.MockedFunction<
  typeof getTxExplorerLink
>;

describe("DonationSuccess", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("shows a countdown initially and then renders the transaction link", () => {
    const txHash = "0xABC123";
    const url = `https://etherscan.io/tx/${txHash}`;

    mockedGetTxExplorerLink.mockReturnValue(url);

    render(<DonationSuccess txHash={txHash} onReset={jest.fn()} />);

    // initial shimmering countdown
    expect(screen.getByText(/Transaction indexing… 2s/i)).toBeInTheDocument();

    // fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // now the link appears
    const link = screen.getByRole("link", { name: /View transaction/i });
    expect(link).toHaveAttribute("href", url);
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("calls onReset when the Donate again button is clicked", () => {
    const onReset = jest.fn();
    render(<DonationSuccess txHash="0xDEF456" onReset={onReset} />);

    const button = screen.getByRole("button", { name: /Donate again/i });
    fireEvent.click(button);
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
