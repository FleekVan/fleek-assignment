import { z } from "zod";

export const DatabaseConfigSchema = z.object({
  username: z.string(),
  password: z.string(),
  dbname: z.string(),
  engine: z.string(),
  port: z.number(),
  dbInstanceIdentifier: z.string(),
  host: z.string(),
});

export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
