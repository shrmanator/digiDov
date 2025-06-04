import { useCharitySetup } from "./use-charity-setup";
import { renderHook } from "@testing-library/react";
import { act } from "react-dom/test-utils";

describe("useCharitySetup hook", () => {
  const walletAddress = "0xABC";
  const defaultEmail = "default@example.com";

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // @ts-ignore
    delete global.fetch;
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

    act(() => {
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
      }));
    });

    act(() => {
      result.current.nextOrgInfo();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.step).toBe("receiptPreference");
  });

  it("agreeFee and back navigate between feeAgreement and donationUrl", () => {
    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );

    act(() => result.current.agreeFee());
    expect(result.current.step).toBe("donationUrl");

    act(() => result.current.back());
    expect(result.current.step).toBe("feeAgreement");
  });

  it("submitAuthorizedContact success advances, sets slug, and includes correct email", async () => {
    // Mock fetch to return { ok: true, json: { charity: { slug: "new-slug" } } }
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ charity: { slug: "new-slug" } }),
    });

    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );

    // Fill form and move through steps
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
        charity_sends_receipt: true,
      }));
      result.current.nextOrgInfo(); // → "receiptPreference"
      result.current.nextReceiptPref(); // → "contactInfo"
    });

    // Call submitAuthorizedContact()
    await act(async () => {
      await result.current.submitAuthorizedContact();
    });

    // 1) Check fetch was called once with the right URL
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/charity-dashboard/overview",
      expect.any(Object)
    );

    // 2) Grab the init object, parse its body, and assert required fields exist
    const fetchInit = (global.fetch as jest.Mock).mock.calls[0][1];
    const parsedBody = JSON.parse(fetchInit.body);

    expect(parsedBody).toEqual(
      expect.objectContaining({
        wallet_address: walletAddress,
        registration_number: "123456789",
        charity_name: "Charity Inc",
        registered_address: "123 Main St",
        contact_title: "Ms",
        contact_first_name: "Jane",
        contact_last_name: "Doe",
        contact_email: "jane@override.com",
        contact_phone: "555-1234",
        charity_sends_receipt: true,
      })
    );

    // 3) Check headers and method
    expect(fetchInit.method).toBe("POST");
    expect(fetchInit.headers).toEqual({ "Content-Type": "application/json" });

    // 4) Final hook state assertions
    expect(result.current.charitySlug).toBe("new-slug");
    expect(result.current.step).toBe("feeAgreement");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("submitAuthorizedContact failure sets error message and stops loading", async () => {
    // Mock fetch to return { ok: false, json: { error: "Error saving contact info. Please try again." } }
    // @ts-ignore
    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: "Error saving contact info. Please try again.",
      }),
    });

    const { result } = renderHook(() =>
      useCharitySetup(walletAddress, defaultEmail)
    );

    // Move to "contactInfo" step
    act(() => {
      result.current.setForm((f) => ({
        ...f,
        registration_number: "123456789",
        charity_sends_receipt: true,
      }));
      result.current.nextOrgInfo();
      result.current.nextReceiptPref();
    });

    await act(async () => {
      await result.current.submitAuthorizedContact();
    });

    expect(result.current.error).toBe(
      "Error saving contact info. Please try again."
    );
    expect(result.current.isLoading).toBe(false);
  });
});
