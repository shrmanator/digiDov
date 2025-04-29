// Mock the upsertCharity action *before* importing the hook
jest.mock("@/app/actions/charities", () => ({
  __esModule: true,
  upsertCharity: jest.fn(),
}));

import * as actions from "@/app/actions/charities";
import { useCharitySetup } from "./use-charity-setup";
import { renderHook } from "@testing-library/react";
import { act } from "react";

describe("useCharitySetup hook", () => {
  const walletAddress = "0xABC";
  const defaultEmail = "default@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes correctly and injects defaultEmail", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    expect(result.current.step).toBe("charityOrganizationInfo");
    expect(result.current.form.contact_email).toBe(defaultEmail);
    expect(result.current.charitySlug).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("nextOrgInfo guards short registration_number", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() => {
      result.current.nextOrgInfo();
    });
    expect(result.current.error).toBe("Ensure a valid registration number.");
    expect(result.current.step).toBe("charityOrganizationInfo");
  });

  it("nextOrgInfo advances on valid registration_number", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );

    // 1) Update the form to a valid registration_number
    act(() => {
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
      }));
    });

    // 2) Now call nextOrgInfo()
    act(() => {
      result.current.nextOrgInfo();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.step).toBe("authorizedContactInfo");
  });

  it("agreeFee and back transition the steps correctly", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() => result.current.agreeFee());
    expect(result.current.step).toBe("donationUrl");

    act(() => result.current.back());
    expect(result.current.step).toBe("feeAgreement");
  });

  it("submitContact on success advances, sets slug, and includes correct email", async () => {
    (actions.upsertCharity as jest.Mock).mockResolvedValue({
      slug: "new-slug",
    });

    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );

    // Prepare a fully valid form
    act(() => {
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
        charity_name: "Charity Inc",
        registered_address: "123 Main St",
        contact_title: "Ms",
        contact_first_name: "Jane",
        contact_last_name: "Doe",
        contact_email: "jane@override.com",
        contact_phone: "555-1234",
      }));
      result.current.nextOrgInfo();
    });

    // Call the async submitContact
    await act(async () => {
      await result.current.submitContact();
    });

    expect(actions.upsertCharity).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet_address: walletAddress,
        contact_email: "jane@override.com",
      })
    );
    expect(result.current.charitySlug).toBe("new-slug");
    expect(result.current.step).toBe("feeAgreement");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("submitContact on failure sets the error message", async () => {
    (actions.upsertCharity as jest.Mock).mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );

    act(() => {
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
      }));
      result.current.nextOrgInfo();
    });

    await act(async () => {
      await result.current.submitContact();
    });

    expect(result.current.error).toBe(
      "Error saving profile. Please try again."
    );
    expect(result.current.isLoading).toBe(false);
  });
});
