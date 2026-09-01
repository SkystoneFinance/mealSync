import { z } from "zod";

export const activateStaffSchema = z.object({
  staffNumber: z
    .string()
    .min(1, "Staff number is required"),

  phoneNumber: z
    .string()
    .min(10, "Valid phone number is required")
    .max(15, "Invalid phone number"),
});

export const verifyStaffOtpSchema = z.object({
  staffNumber: z
    .string()
    .min(1, "Staff number is required"),

  phoneNumber: z
    .string()
    .min(10, "Valid phone number is required")
    .max(15, "Invalid phone number"),

  code: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
});
