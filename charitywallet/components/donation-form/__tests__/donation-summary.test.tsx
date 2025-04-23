import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DonationSummary } from "../donation-summary";

describe("DonationSummary", () => {
  const onToggle = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("shows the fee amount when checked", () => {
    render(
      <DonationSummary
        coverFee={true}
        feeAmount={1.23}
        onToggleCoverFee={onToggle}
      />
    );
    // Must match the full label text
    expect(
      screen.getByText(/Cover 3% processing fee \(\+\$1\.23\)/i)
    ).toBeInTheDocument();
  });

  it("omits the amount when unchecked", () => {
    render(
      <DonationSummary
        coverFee={false}
        feeAmount={1.23}
        onToggleCoverFee={onToggle}
      />
    );
    // The label text without the "(+$1.23)" suffix
    expect(screen.getByText(/Cover 3% processing fee$/i)).toBeInTheDocument();
    expect(screen.queryByText(/\+\$1\.23/)).toBeNull();
  });

  it("fires onToggleCoverFee when the checkbox is clicked", () => {
    render(
      <DonationSummary
        coverFee={false}
        feeAmount={0}
        onToggleCoverFee={onToggle}
      />
    );
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onToggle).toHaveBeenCalled();
  });
});
