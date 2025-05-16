import { z } from "zod";

export const TxSchema = z.object({
  quoteId: z.number(),
  gasId: z.number(),
  email: z.string().email(),
  wallet: z.string().min(1),
  leftSideLabel: z.string(),
  leftSideValue: z.number(),
  rightSideLabel: z.string(),
  ethCost: z.string().optional(),
  vendorId: z.number().optional(),
  useReferral: z.boolean().optional(),
});

// TS types you can import anywhere
export type TxPayload = z.infer<typeof TxSchema>;
