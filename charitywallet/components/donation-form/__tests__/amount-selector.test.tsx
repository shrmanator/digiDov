import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AmountSelector } from "../amount-selector";

describe("AmountSelector", () => {
  const onPresetClick = jest.fn();
  const onCustomChange = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it("renders the preset labels and badges", () => {
    render(
      <AmountSelector
        presetAmounts={[10, 20]}
        selectedAmount={20}
        customAmount=""
        onPresetClick={onPresetClick}
        onCustomChange={onCustomChange}
        tokenPrice={2}
        nativeSymbol="ETH"
        tokenFloat={0}
      />
    );
    // Look for the $10 label (span) and the badge
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("$20")).toBeInTheDocument();
    expect(screen.getByText("~5.000 ETH")).toBeInTheDocument();
  });

  it("calls onPresetClick when I click a preset", () => {
    render(
      <AmountSelector
        presetAmounts={[5]}
        selectedAmount={null}
        customAmount=""
        onPresetClick={onPresetClick}
        onCustomChange={onCustomChange}
        tokenPrice={1}
        nativeSymbol="ETH"
        tokenFloat={0}
      />
    );
    fireEvent.click(screen.getByText("$5"));
    expect(onPresetClick).toHaveBeenCalledWith(5);
  });

  it("renders the custom input and calls onCustomChange", () => {
    render(
      <AmountSelector
        presetAmounts={[]}
        selectedAmount={null}
        customAmount="123"
        onPresetClick={onPresetClick}
        onCustomChange={onCustomChange}
        tokenPrice={10}
        nativeSymbol="ETH"
        tokenFloat={0}
      />
    );
    const input = screen.getByPlaceholderText("e.g. 100");
    fireEvent.change(input, { target: { value: "200" } });
    expect(onCustomChange).toHaveBeenCalled();
  });
});
