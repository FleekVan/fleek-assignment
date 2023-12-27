import { z } from "zod";

const PaginationCommonSchema = z.object({
  limit: z.number().int().positive().default(10),
  offset: z.number().int().min(0).default(0),
});

export const PaginationMetaSchema = PaginationCommonSchema.extend({
  total: z.number().int().default(0),
});

export const PaginationInputSchema = PaginationCommonSchema;

export type PaginationInput = z.input<typeof PaginationInputSchema>;
