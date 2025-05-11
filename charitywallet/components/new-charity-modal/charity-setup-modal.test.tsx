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

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CharitySetupModal from "./charity-setup-modal";
import { useProfiles } from "thirdweb/react";
import { useCharitySetup } from "@/hooks/use-charity-setup";
import { useRouter } from "next/navigation";

import { CharityOrganizationInfoStep as OriginalOrgInfoStep } from "./charity-organiztion-info-step";
import { CharityAuthorizedContactInfoStep as OriginalAuthorizedContactInfoStep } from "./charity-authorized-contact-step";
import { FeeAgreementStep as OriginalFeeAgreementStep } from "./fee-agreement-step";
import { DonationUrlStep as OriginalDonationUrlStep } from "./donation-url-step";
import { ReceiptPreferenceStep as OriginalReceiptPreferenceStep } from "./tax-receipt-preference";

// Mock Dialog components to expose data-testid
jest.mock("@/components/ui/dialog", () => ({
  __esModule: true,
  Dialog: (props: React.ComponentProps<"div">) => (
    <div {...props}>{props.children}</div>
  ),
  DialogContent: (props: React.ComponentProps<"div">) => (
    <div {...props}>{props.children}</div>
  ),
}));

// Mock org-info step
jest.mock("./charity-organiztion-info-step", () => ({
  __esModule: true,
  CharityOrganizationInfoStep: ({
    onNext,
    onChange,
    formData,
  }: React.ComponentProps<typeof OriginalOrgInfoStep>) => (
    <div data-testid="org-info-step">
      <label htmlFor="org-info-input">Charity Name</label>
      <input
        id="org-info-input"
        data-testid="org-info-input"
        name="charity_name"
        value={formData.charity_name}
        onChange={onChange}
        placeholder="Enter charity name"
        aria-label="Charity Name"
      />
      <button data-testid="org-info-next" onClick={onNext}>
        Next
      </button>
    </div>
  ),
}));

// Mock receipt-pref step
jest.mock("./tax-receipt-preference", () => ({
  __esModule: true,
  ReceiptPreferenceStep: ({
    onNext,
    onBack,
    isLoading,
  }: React.ComponentProps<typeof OriginalReceiptPreferenceStep>) => (
    <div data-testid="receipt-preference-step">
      <button data-testid="receipt-back" onClick={onBack} disabled={isLoading}>
        Back
      </button>
      <button data-testid="receipt-next" onClick={onNext} disabled={isLoading}>
        {isLoading ? <svg data-testid="receipt-spinner" /> : "Next"}
      </button>
    </div>
  ),
}));

// Mock contact-info step
jest.mock("./charity-authorized-contact-step", () => ({
  __esModule: true,
  AuthorizedContactInfoStep: ({
    onSubmit,
    onChange,
    showEmailField,
    formData,
  }: React.ComponentProps<typeof OriginalAuthorizedContactInfoStep>) => (
    <div
      data-testid="contact-info-step"
      data-show-email={String(showEmailField)}
    >
      {showEmailField && (
        <>
          <label htmlFor="contact-email-input">Contact Email</label>
          <input
            id="contact-email-input"
            data-testid="contact-email-input"
            name="contact_email"
            value={formData.contact_email}
            onChange={onChange}
            placeholder="Enter contact email"
            aria-label="Contact Email"
          />
        </>
      )}
      <button data-testid="contact-submit" onClick={onSubmit}>
        Submit
      </button>
    </div>
  ),
}));

// Mock fee-agreement step
jest.mock("./fee-agreement-step", () => ({
  __esModule: true,
  FeeAgreementStep: ({
    onAgree,
  }: React.ComponentProps<typeof OriginalFeeAgreementStep>) => (
    <div data-testid="fee-agreement-step">
      <button data-testid="fee-agree" onClick={onAgree}>
        Agree
      </button>
    </div>
  ),
}));

// Mock donation-url step
jest.mock("./donation-url-step", () => ({
  __esModule: true,
  DonationUrlStep: ({
    onFinish,
  }: React.ComponentProps<typeof OriginalDonationUrlStep>) => (
    <div data-testid="donation-url-step">
      <button data-testid="donation-finish" onClick={onFinish}>
        Finish
      </button>
    </div>
  ),
}));

const mockSetForm = jest.fn();
const mockNextOrgInfo = jest.fn();
const mockNextReceiptPref = jest.fn();
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
  charity_sends_receipt: false,
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
    nextReceiptPref: mockNextReceiptPref,
    submitAuthorizedContact: mockSubmitContact,
    agreeFee: mockAgreeFee,
    finish: mockFinish,
    back: mockBack,
  });
  (useProfiles as jest.Mock).mockReturnValue({
    data: defaultEmail ? [{ details: { email: defaultEmail } }] : [],
  });
  render(<CharitySetupModal walletAddress="0x123" />);
}

describe("CharitySetupModal integration", () => {
  it("org-info step works", () => {
    setup("charityOrganizationInfo");
    expect(screen.getByTestId("org-info-step")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("org-info-next"));
    expect(mockNextOrgInfo).toHaveBeenCalled();
  });

  it("contact-info step shows email field when none provided", () => {
    setup("authorizedContactInfo", {}, "");
    expect(screen.getByTestId("contact-info-step")).toBeInTheDocument();
    expect(screen.getByTestId("contact-email-input")).toBeInTheDocument();
  });

  it("fee-agreement step works", () => {
    setup("feeAgreement");
    expect(screen.getByTestId("fee-agreement-step")).toBeInTheDocument();
  });

  it("donation-url step finishes and refreshes", () => {
    setup("donationUrl");
    expect(screen.getByTestId("donation-url-step")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("donation-finish"));
    expect(mockFinish).toHaveBeenCalled();
    expect(mockRefresh).toHaveBeenCalled();
  });
});

describe("ReceiptPreferenceStep loading state", () => {
  beforeEach(() => {
    (useCharitySetup as jest.Mock).mockReturnValue({
      step: "receiptPreference",
      form: { ...baseForm },
      setForm: mockSetForm,
      charitySlug: "charity-slug",
      isLoading: true,
      error: "",
      nextOrgInfo: mockNextOrgInfo,
      nextReceiptPref: mockNextReceiptPref,
      submitAuthorizedContact: mockSubmitContact,
      agreeFee: mockAgreeFee,
      finish: mockFinish,
      back: mockBack,
    });
    render(<CharitySetupModal walletAddress="0x123" />);
  });

  it("disables both buttons when loading", () => {
    expect(screen.getByTestId("receipt-back")).toBeDisabled();
    expect(screen.getByTestId("receipt-next")).toBeDisabled();
  });

  it("renders the spinner icon in Next button", () => {
    expect(screen.getByTestId("receipt-spinner")).toBeInTheDocument();
  });
});
