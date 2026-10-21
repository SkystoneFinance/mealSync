import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/error";

export async function validate<T>(
  schema: ZodSchema<T>,
  data: unknown,
): Promise<T> {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      // 400 with the first problem, not a generic 500
      throw new AppError(
        400,
        error.issues[0]?.message ?? "Validation failed.",
      );
    }

    throw error;
  }
}
