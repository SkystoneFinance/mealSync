import type { ZodSchema } from "zod";

import { AppError } from "../utils/error";

export async function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): Promise<T> {
  const result = await schema.safeParseAsync(data);

  if (!result.success) {
    throw new AppError(
      400,
      result.error.issues[0]?.message ?? "Validation failed.",
    );
  }

  return result.data;
}