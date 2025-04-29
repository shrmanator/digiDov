// Mock out the charities action before importing the hook to avoid importing ESM modules from stytch
jest.mock("@/app/actions/charities", () => ({
  __esModule: true,
  upsertCharity: jest.fn(),
}));

import { renderHook } from "@testing-library/react";
import { act } from "react";
import { useCharitySetup } from "@/hooks/use-charity-setup";
import * as actions from "@/app/actions/charities";

describe("useCharitySetup hook", () => {
  const walletAddress = "0xABC";
  const defaultEmail = "default@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("initializes with default values and injects defaultEmail into form", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    expect(result.current.step).toBe("charityOrganizationInfo");
    expect(result.current.form.contact_email).toBe(defaultEmail);
    expect(result.current.charitySlug).toBe("");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("nextOrgInfo sets error for short registration_number and does not advance", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() => {
      result.current.nextOrgInfo();
    });
    expect(result.current.error).toBe("Ensure a valid registration number.");
    expect(result.current.step).toBe("charityOrganizationInfo");
  });

  it("nextOrgInfo advances step when registration_number is long enough", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() => {
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
      }));
    });
    act(() => {
      result.current.nextOrgInfo();
    });
    expect(result.current.error).toBe(null);
    expect(result.current.step).toBe("authorizedContactInfo");
  });

  it("back navigates correctly between steps", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() =>
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
      }))
    );
    act(() => result.current.nextOrgInfo());
    act(() => result.current.agreeFee());
    expect(result.current.step).toBe("donationUrl");

    act(() => result.current.back());
    expect(result.current.step).toBe("feeAgreement");
    act(() => result.current.back());
    expect(result.current.step).toBe("authorizedContactInfo");
  });

  it("agreeFee moves to donationUrl", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() => result.current.agreeFee());
    expect(result.current.step).toBe("donationUrl");
  });

  it("submitContact handles success and advances to feeAgreement", async () => {
    const updated = { slug: "new-slug" };
    jest.spyOn(actions, "upsertCharity").mockResolvedValue(updated as any);

    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    // Prepare full form data, defaultEmail should already be injected but override contact_email too
    act(() =>
      result.current.setForm((f) => ({
        ...f,
        charity_name: "Charity Inc",
        registered_address: "123 Main St",
        registration_number: "123456789",
        contact_title: "Ms",
        contact_first_name: "Jane",
        contact_last_name: "Doe",
        contact_email: "jane@override.com",
        contact_phone: "555-1234",
        shaduicn: false,
      }))
    );
    act(() => result.current.nextOrgInfo());

    await act(async () => {
      await result.current.submitContact();
    });

    // Verify upsertCharity payload includes injected defaultEmail
    expect(actions.upsertCharity).toHaveBeenCalledWith(
      expect.objectContaining({
        wallet_address: walletAddress,
        charity_name: "Charity Inc",
        registered_address: "123 Main St",
        registration_number: "123456789",
        contact_title: "Ms",
        contact_first_name: "Jane",
        contact_last_name: "Doe",
        contact_email: "jane@override.com",
        contact_phone: "555-1234",
        is_profile_complete: true,
      })
    );

    expect(result.current.charitySlug).toBe("new-slug");
    expect(result.current.step).toBe("feeAgreement");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("submitContact handles failure and sets error", async () => {
    jest.spyOn(actions, "upsertCharity").mockRejectedValue(new Error("fail"));

    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );
    act(() =>
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
      }))
    );
    act(() => result.current.nextOrgInfo());

    await act(async () => {
      await result.current.submitContact();
    });

    expect(result.current.error).toBe(
      "Error saving profile. Please try again."
    );
    expect(result.current.isLoading).toBe(false);
  });
});
