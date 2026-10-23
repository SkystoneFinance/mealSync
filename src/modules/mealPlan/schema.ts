import { z } from "zod";

const dateKey = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must be YYYY-MM-DD");

// One day's choice: a dish, or "No meal required"
const daySelectionSchema = z
  .object({
    date: dateKey,
    foodOptionId: z.string().uuid().nullable().optional(),
    noMeal: z.boolean().optional(),
  })
  .refine(
    (d) => Boolean(d.noMeal) !== Boolean(d.foodOptionId),
    {
      message:
        'Choose either a meal or "No meal required" for each day.',
    },
  );

export const submitPlanSchema = z.object({
  weekStart: dateKey,
  selections: z.array(daySelectionSchema).max(5),
});

export const reopenSchema = z.object({
  staffId: z.string().uuid("Choose a staff member."),
});

export const closedDaysSchema = z.object({
  dates: z.array(dateKey).max(5),
});

export type DaySelectionInput = z.infer<typeof daySelectionSchema>;
