import { z } from "zod";

export const createMealSelectionSchema = z.object({
  foodOptionId: z
    .string()
    .uuid("Invalid food option ID"),

  mealDate: z
    .string()
    .min(1, "Meal date is required"),
});

export const updateMealSelectionSchema = z.object({
  foodOptionId: z
    .string()
    .uuid("Invalid food option ID"),
});

export const mealSelectionIdSchema = z.object({
  id: z
    .string()
    .uuid("Invalid meal selection ID"),
});