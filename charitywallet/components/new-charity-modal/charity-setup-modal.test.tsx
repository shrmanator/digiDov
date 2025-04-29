// Pre-mock external modules before imports
jest.mock("thirdweb/react", () => ({
  __esModule: true,
  useProfiles: jest.fn(),
}));
jest.mock("@/hooks/use-charity-setup", () => ({
  __esModule: true,
  useCharitySetup: jest.fn(),
}));
jest.mock("next/navigation", () => ({ useRouter: jest.fn() }));

// Mock Dialog components to expose data-testid
jest.mock("@/components/ui/dialog", () => {
  const React = require("react");
  return {
    Dialog: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DialogContent: ({ children, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  };
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CharitySetupModal from "./charity-setup-modal";
import { useProfiles } from "thirdweb/react";
import { useCharitySetup } from "@/hooks/use-charity-setup";
import { useRouter } from "next/navigation";

// Mock child components with interactive elements
jest.mock("./charity-organiztion-info-step", () => ({
  CharityOrganizationInfoStep: ({ onNext, onChange, formData }: any) => (
    <div data-testid="org-info-step">
      <button data-testid="org-info-next" onClick={onNext}>
        Next
      </button>
      <label htmlFor="charity_name">Charity Name</label>
      <input
        id="charity_name"
        data-testid="org-info-input"
        name="charity_name"
        value={formData.charity_name}
        onChange={onChange}
        title="Charity Name"
        placeholder="Enter charity name"
      />
    </div>
  ),
}));

jest.mock("./charity-authorized-contact-step", () => ({
  AuthorizedContactInfoStep: ({
    onSubmit,
    onChange,
    showEmailField,
    formData,
  }: any) => (
    <div data-testid="contact-info-step" data-show-email={showEmailField}>
      {showEmailField && (
        <input
          data-testid="contact-email-input"
          name="contact_email"
          value={formData.contact_email}
          onChange={onChange}
          title="Contact Email"
          placeholder="Enter contact email"
        />
      )}
      <button data-testid="contact-submit" onClick={onSubmit}>
        Submit
      </button>
    </div>
  ),
}));

jest.mock("./fee-agreement-step", () => ({
  FeeAgreementStep: ({ onAgree }: any) => (
    <div data-testid="fee-agreement-step">
      <button data-testid="fee-agree" onClick={onAgree}>
        Agree
      </button>
    </div>
  ),
}));

jest.mock("./donation-url-step", () => ({
  DonationUrlStep: ({ onFinish }: any) => (
    <div data-testid="donation-url-step">
      <button data-testid="donation-finish" onClick={onFinish}>
        Finish
      </button>
    </div>
  ),
}));

const mockSetForm = jest.fn();
const mockNextOrgInfo = jest.fn();
const mockSubmitContact = jest.fn();
const mockAgreeFee = jest.fn();
const mockFinish = jest.fn();
const mockBack = jest.fn();
const mockRefresh = jest.fn();

const baseForm = {
  charity_name: "Charity",
  registered_address: "123 Street",
  registration_number: "REG123456",
  contact_title: "Mr",
  contact_first_name: "John",
  contact_last_name: "Doe",
  contact_email: "john@doe.com",
  contact_phone: "123456789",
  shaduicn: false,
};

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue({ refresh: mockRefresh });
  (useProfiles as jest.Mock).mockReturnValue({
    data: [{ details: { email: "profile@email.com" } }],
  });
  jest.clearAllMocks();
});

function setup(
  step: string,
  overrides: Partial<typeof baseForm> = {},
  defaultEmail = "profile@email.com"
) {
  (useCharitySetup as jest.Mock).mockReturnValue({
    step,
    form: { ...baseForm, ...overrides },
    setForm: mockSetForm,
    charitySlug: "charity-slug",
    isLoading: false,
    error: "",
    nextOrgInfo: mockNextOrgInfo,
    submitContact: mockSubmitContact,
    agreeFee: mockAgreeFee,
    finish: mockFinish,
    back: mockBack,
  });
  (useProfiles as jest.Mock).mockReturnValue({
    data: defaultEmail ? [{ details: { email: defaultEmail } }] : [],
  });
  return render(<CharitySetupModal walletAddress="0x123" />);
}

describe("CharitySetupModal", () => {
  it("renders the modal dialog", () => {
    setup("charityOrganizationInfo");
    expect(screen.getByTestId("charity-setup-modal")).toBeInTheDocument();
  });

  it("renders CharityOrganizationInfoStep when step is 'charityOrganizationInfo'", () => {
    setup("charityOrganizationInfo");
    expect(screen.getByTestId("org-info-step")).toBeInTheDocument();
  });

  it("calls setForm on input change in CharityOrganizationInfoStep", () => {
    setup("charityOrganizationInfo");
    const input = screen.getByTestId("org-info-input");
    fireEvent.change(input, {
      target: { name: "charity_name", value: "New Name" },
    });
    expect(mockSetForm).toHaveBeenCalled();
  });

  it("calls nextOrgInfo on Next button click", () => {
    setup("charityOrganizationInfo");
    fireEvent.click(screen.getByTestId("org-info-next"));
    expect(mockNextOrgInfo).toHaveBeenCalled();
  });

  it("renders AuthorizedContactInfoStep when step is 'authorizedContactInfo'", () => {
    setup("authorizedContactInfo");
    expect(screen.getByTestId("contact-info-step")).toBeInTheDocument();
  });

  it("shows email field in AuthorizedContactInfoStep if no default email", () => {
    setup("authorizedContactInfo", {}, "");
    const step = screen.getByTestId("contact-info-step");
    expect(step.getAttribute("data-show-email")).toBe("true");
  });

  it("calls submitContact on Submit button click", () => {
    setup("authorizedContactInfo");
    fireEvent.click(screen.getByTestId("contact-submit"));
    expect(mockSubmitContact).toHaveBeenCalled();
  });

  it("renders FeeAgreementStep when step is 'feeAgreement'", () => {
    setup("feeAgreement");
    expect(screen.getByTestId("fee-agreement-step")).toBeInTheDocument();
  });

  it("calls agreeFee on Agree button click", () => {
    setup("feeAgreement");
    fireEvent.click(screen.getByTestId("fee-agree"));
    expect(mockAgreeFee).toHaveBeenCalled();
  });

  it("renders DonationUrlStep when step is 'donationUrl'", () => {
    setup("donationUrl");
    expect(screen.getByTestId("donation-url-step")).toBeInTheDocument();
  });

  it("calls finish and router.refresh on Finish button click", () => {
    setup("donationUrl");
    fireEvent.click(screen.getByTestId("donation-finish"));
    expect(mockFinish).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });
});
