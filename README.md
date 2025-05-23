# digiDov (dd)

A non-custodial, smart-contract–driven donation dApp that automates fee splitting, CRA-compliant tax receipt generation, and record-keeping.

## Overview

digiDov enables charities to accept crypto donations without managing custody. Charities register via OAuth and link their wallet. Donors connect their own wallet to the charity’s donor page and call the `donateAndSwap` function on the FeeDeduction contract. That function:

1. Swaps donated ETH to USDC  
2. Sends 97 % of USDC to the charity’s wallet  
3. Retains a 3 % platform fee  

All donation events are captured on-chain and processed by a webhook, which records donor details, issues CRA-compliant PDF receipts, and emails donor and charity.

## Key Components

- **Smart Contract**  
  - `donateAndSwap(uint256 minUsdcOut, address charity)`  
  - Emits `DonationProcessed` events with donor address, amounts, and transaction hash  

- **Frontend (Next.js + React + Ethers 6)**  
  - `useSendWithFee` hook shows a donor‐profile modal (email, name, address) before calling the contract  
  - `TaxReceiptDrawer` component lets donors view/download past receipts  

- **Backend Webhook**  
  - Listens at `/api/webhook/fee-deduction`  
  - Parses on-chain events, creates Prisma records, generates PDF receipts, and dispatches emails  

- **Database (Prisma)**  
  - Models: `Donor`, `Charity`, `Donation`  
  - Fields: `usdcSent`, `transactionHash`, timestamps, donor profile data