import { z } from "zod";


// ==========================================
// FIRST-TIME STAFF ACTIVATION
// ==========================================

export const activateStaffSchema = z
  .object({
    staffNumber: z
      .string()
      .min(
        1,
        "Staff number is required",
      ),

    pin: z
      .string()
      .length(
        4,
        "PIN must be exactly 4 digits",
      )
      .regex(
        /^\d+$/,
        "PIN must contain only numbers",
      ),

    confirmPin: z
      .string()
      .length(
        4,
        "PIN confirmation must be exactly 4 digits",
      )
      .regex(
        /^\d+$/,
        "PIN confirmation must contain only numbers",
      ),
  })
  .refine(
    (data) =>
      data.pin === data.confirmPin,
    {
      message: "PINs do not match",
      path: ["confirmPin"],
    },
  );


// ==========================================
// STAFF LOGIN
// ==========================================

export const staffLoginSchema = z.object({
  staffNumber: z
    .string()
    .min(
      1,
      "Staff number is required",
    ),

  pin: z
    .string()
    .length(
      4,
      "PIN must be exactly 4 digits",
    )
    .regex(
      /^\d+$/,
      "PIN must contain only numbers",
    ),
});