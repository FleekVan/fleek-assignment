import { GraphQLError } from "graphql";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export function zodValidate<T extends z.ZodType<any>>(
  schema: T,
  input: z.input<T>,
): z.output<T> {
  try {
    return schema.parse(input);
  } catch (e) {
    const validationError = fromZodError(e);
    throw new GraphQLError(validationError.message, {
      extensions: {
        code: "BAD_USER_INPUT",
        validationError,
      },
    });
  }
}
