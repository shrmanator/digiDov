// import React from "react";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import DonationHistory from "./transaction-history-via-db";
// import { DonationReceipt } from "../app/types/receipt";

// describe("DonationHistory Component", () => {
//   beforeAll(() => {
//     // Mock clipboard
//     Object.assign(navigator, {
//       clipboard: {
//         writeText: jest.fn().mockResolvedValue(undefined),
//       },
//     });
//   });

//   it("shows empty state without link when no receipts and no donationLink", () => {
//     render(<DonationHistory receipts={[]} />);
//     expect(screen.getByText("No donation receipts found.")).toBeInTheDocument();
//     expect(screen.queryByText(/Share this donation link/i)).toBeNull();
//   });

//   it("renders empty state with donationLink and copy interaction", async () => {
//     const mockLink = "https://donate.example.com";
//     render(<DonationHistory receipts={[]} donationLink={mockLink} />);

//     expect(screen.getByText("No donation receipts found.")).toBeInTheDocument();
//     expect(
//       screen.getByText("Share this donation link to start accepting donations:")
//     ).toBeInTheDocument();

//     const linkBox = screen.getByText(mockLink).closest("div");
//     expect(linkBox).toHaveClass("cursor-pointer");
//     fireEvent.click(linkBox!);
//     await waitFor(() =>
//       expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockLink)
//     );
//     expect(screen.getByText("Link copied!")).toBeInTheDocument();
//   });

//   it("renders receipt list and copy transaction hash", async () => {
//     const sample: any = {
//       id: "1",
//       receipt_number: "001",
//       donation_date: new Date().toISOString(),
//       fiat_amount: 42,
//       transaction_hash: "0xtxhash",
//       chainId: "0x1",
//       donor: {
//         first_name: "Alice",
//         last_name: "Smith",
//         email: "alice@example.com",
//       },
//       charity: { charity_name: "Test Charity", registration_number: null },
//     };
//     render(<DonationHistory receipts={[sample as DonationReceipt]} />);

//     expect(screen.getByText("$42.00")).toBeInTheDocument();
//     expect(screen.getByText("Alice Smith")).toBeInTheDocument();

//     const hashSpan = screen.getByText(/0xtxhash/);
//     const copyBtn = hashSpan.nextSibling as HTMLElement;
//     fireEvent.click(copyBtn);
//     await waitFor(() =>
//       expect(navigator.clipboard.writeText).toHaveBeenCalledWith("0xtxhash")
//     );
//   });

//   it("sorts receipts by most recent date first", () => {
//     const older: any = {
//       id: "2",
//       receipt_number: "002",
//       donation_date: new Date(Date.now() - 100000).toISOString(),
//       fiat_amount: 5,
//       transaction_hash: "0xold",
//       chainId: "0x1",
//       donor: null,
//       charity: null,
//     };
//     const newer: any = {
//       id: "3",
//       receipt_number: "003",
//       donation_date: new Date().toISOString(),
//       fiat_amount: 10,
//       transaction_hash: "0xnew",
//       chainId: "0x1",
//       donor: null,
//       charity: null,
//     };

//     render(
//       <DonationHistory
//         receipts={[older as DonationReceipt, newer as DonationReceipt]}
//       />
//     );
//     const amounts = screen.getAllByText(/\$[0-9]+\.[0-9]{2}/);
//     expect(amounts[0]).toHaveTextContent("$10.00");
//     expect(amounts[1]).toHaveTextContent("$5.00");
//   });

//   it("handles anonymous donor and unknown chain edge cases", () => {
//     const edge: any = {
//       id: "4",
//       receipt_number: "004",
//       donation_date: new Date(Date.now() - 90000).toISOString(),
//       fiat_amount: 10,
//       transaction_hash: "0xedge",
//       chainId: "0x9999",
//       donor: null,
//       charity: { charity_name: "Edge Charity", registration_number: null },
//     };
//     render(<DonationHistory receipts={[edge as DonationReceipt]} />);

//     expect(screen.getByText("Anonymous Donor")).toBeInTheDocument();
//     expect(screen.getByText("Unknown Chain")).toBeInTheDocument();
//   });

//   it("shows just now for very recent donations (<1 minute)", () => {
//     const nowReceipt: any = {
//       id: "5",
//       receipt_number: "005",
//       donation_date: new Date().toISOString(),
//       fiat_amount: 5,
//       transaction_hash: "0xnow",
//       chainId: "0x1",
//       donor: null,
//       charity: null,
//     };
//     render(<DonationHistory receipts={[nowReceipt as DonationReceipt]} />);
//     expect(screen.getByText("just now")).toBeInTheDocument();
//   });
// });
