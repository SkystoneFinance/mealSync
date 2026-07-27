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
      throw new Error(error.issues[0].message);
    }

    throw error;
  }
}