import { z } from "zod";

export const createFoodOptionSchema = z.object({
  name: z
    .string()
    .min(2, "Food name is required"),

  image: z
    .string()
    .min(1, "Food image is required"),

  mealDate: z
    .string()
    .datetime(),
});


export const updateFoodOptionSchema = z.object({

  name: z
    .string()
    .min(2)
    .optional(),

  image: z
    .string()
    .min(1)
    .optional(),

  mealDate: z
    .string()
    .datetime()
    .optional(),

});


export const foodOptionIdSchema = z.object({

  id: z.string().uuid(),

});