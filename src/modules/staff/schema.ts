import { z } from "zod";

export const createStaffSchema = z.object({
  fullName: z.string().min(3),
  staffId: z.string().min(2),
  department: z.string().min(2),
});

export type CreateStaffInput = z.infer<typeof createStaffSchema>;