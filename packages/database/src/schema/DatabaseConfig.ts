import { z } from "zod";
import { NonEmptyString } from "../utils/NonEmptyString";

export const DatabaseConfigSchema = z.object({
  host: NonEmptyString,
  port: z.number(),
  database: NonEmptyString,
  user: NonEmptyString,
  password: NonEmptyString,
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
