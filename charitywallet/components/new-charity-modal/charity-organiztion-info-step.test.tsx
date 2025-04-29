import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { CharityOrganizationInfoStep } from "./charity-organiztion-info-step";

describe("CharityOrganizationInfoStep (integration)", () => {
  const props = {
    formData: {
      charity_name: "Test Org",
      registered_address: "123 Some St",
      registration_number: "123456789RR0001",
    },
    isLoading: false,
    errorMessage: null,
    onChange: jest.fn(),
    onAddressChange: jest.fn(),
    onNext: jest.fn(),
  };

  it("does not render a <form>", () => {
    const { container } = render(<CharityOrganizationInfoStep {...props} />);
    expect(container.querySelector("form")).toBeNull();
  });

  it("renders a Next button with type='button' and calls onNext", () => {
    render(<CharityOrganizationInfoStep {...props} />);
    const nextBtn = screen.getByRole("button", { name: /next/i });
    expect(nextBtn).toHaveAttribute("type", "button");

    fireEvent.click(nextBtn);
    expect(props.onNext).toHaveBeenCalled();
  });

  it("calls onChange when you type into Organization Name", () => {
    render(<CharityOrganizationInfoStep {...props} />);
    const nameInput = screen.getByLabelText(/organization name/i);
    fireEvent.change(nameInput, {
      target: { name: "charity_name", value: "New Org" },
    });
    expect(props.onChange).toHaveBeenCalledTimes(1);
  });
});
