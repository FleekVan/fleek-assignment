import { z } from "zod";
import { NonEmptyString } from "../utils/NonEmptyString";

export const StoreRecordSchema = z.object({
  name: NonEmptyString.max(50),
  value: NonEmptyString.max(100),
});

export type StoreRecord = z.infer<typeof StoreRecordSchema>;
