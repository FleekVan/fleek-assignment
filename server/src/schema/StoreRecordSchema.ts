import { z } from "zod";

export const StoreRecordSchema = z.object({
  name: z.string().min(1).max(50),
  value: z.string().min(1).max(100),
});

export const StoreRecordUpdateSchema = z.object({
  id: z.string().transform((x) => BigInt(x)),
  name: z.string().min(1).max(50),
  value: z.string().min(1).max(100),
});
