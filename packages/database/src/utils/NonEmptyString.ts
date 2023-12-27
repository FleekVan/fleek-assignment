import { z } from "zod";

export const NonEmptyString = z.string().min(1);
