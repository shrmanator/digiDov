import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/contexts/auth-context", () => ({
  __esModule: true,
  useAuth: jest.fn(),
}));

jest.mock("@/hooks/use-incomplete-donor-profile", () => ({
  __esModule: true,
  useIncompleteDonorProfile: jest.fn(),
}));

jest.mock("@/components/new-donor-modal/new-donor-modal", () => ({
  __esModule: true,
  default: ({ walletAddress }: { walletAddress: string }) => (
    <div data-testid="donor-modal">Modal for {walletAddress}</div>
  ),
}));

import { useAuth } from "@/contexts/auth-context";
import { useIncompleteDonorProfile } from "@/hooks/use-incomplete-donor-profile";
import DonorProfileGate from "./donor-profile-gate";

describe("DonorProfileGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the modal for an incomplete donor profile", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { walletAddress: "0xabc", role: "donor" },
      donor: { wallet_address: "0xabc" },
    });
    (useIncompleteDonorProfile as jest.Mock).mockReturnValue({
      isIncomplete: true,
    });

    render(<DonorProfileGate />);
    expect(screen.getByTestId("donor-modal")).toBeInTheDocument();
  });

  it("does not render for charity login", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { walletAddress: "0xabc", role: "charity" },
      donor: null,
    });
    (useIncompleteDonorProfile as jest.Mock).mockReturnValue({
      isIncomplete: false,
    });

    const { container } = render(<DonorProfileGate />);
    expect(container.firstChild).toBeNull();
  });
});

