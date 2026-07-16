import { z } from "zod";

export const createStaffSchema = z.object({
  staffNumber: z.string().trim().min(2),

  firstName: z.string().trim().min(2),

  lastName: z.string().trim().min(2),

  department: z.string().trim().min(2),
});

export const updateStaffSchema = createStaffSchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  });

export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffInput = z.infer<typeof updateStaffSchema>;