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

import React, { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CharitySetupModal from "./charity-setup-modal";
import { useProfiles } from "thirdweb/react";
import { useCharitySetup } from "@/hooks/use-charity-setup";
import { useRouter } from "next/navigation";

import { CharityOrganizationInfoStep as OriginalOrgInfoStep } from "./charity-organiztion-info-step";
import { AuthorizedContactInfoStep as OriginalAuthorizedContactInfoStep } from "./charity-authorized-contact-step";
import { FeeAgreementStep as OriginalFeeAgreementStep } from "./fee-agreement-step";
import { DonationUrlStep as OriginalDonationUrlStep } from "./donation-url-step";

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

// Mock child components with interactive elements
jest.mock("./charity-organiztion-info-step", () => ({
  __esModule: true,
  CharityOrganizationInfoStep: ({
    onNext,
    onChange,
    formData,
  }: ComponentProps<typeof OriginalOrgInfoStep>) => (
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
  __esModule: true,
  AuthorizedContactInfoStep: ({
    onSubmit,
    onChange,
    showEmailField,
    formData,
  }: ComponentProps<typeof OriginalAuthorizedContactInfoStep>) => (
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
  __esModule: true,
  FeeAgreementStep: ({
    onAgree,
  }: ComponentProps<typeof OriginalFeeAgreementStep>) => (
    <div data-testid="fee-agreement-step">
      <button data-testid="fee-agree" onClick={onAgree}>
        Agree
      </button>
    </div>
  ),
}));

jest.mock("./donation-url-step", () => ({
  __esModule: true,
  DonationUrlStep: ({
    onFinish,
  }: ComponentProps<typeof OriginalDonationUrlStep>) => (
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
  it("calls useCharitySetup with walletAddress and default email from profile", () => {
    setup("charityOrganizationInfo");
    expect(useCharitySetup).toHaveBeenCalledWith("0x123", "profile@email.com");
  });

  it("passes empty defaultEmail when no profile email", () => {
    setup("charityOrganizationInfo", {}, "");
    expect(useCharitySetup).toHaveBeenCalledWith("0x123", "");
  });
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
    expect(screen.getByTestId("contact-email-input")).toBeInTheDocument();
  });

  it("does not show email field when defaultEmail is provided", () => {
    setup("authorizedContactInfo", {}, "user@example.com");
    const step = screen.getByTestId("contact-info-step");
    expect(step.getAttribute("data-show-email")).toBe("false");
    expect(screen.queryByTestId("contact-email-input")).toBeNull();
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
