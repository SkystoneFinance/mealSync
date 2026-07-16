import { z } from "zod";

export const scanAttendanceSchema = z.object({
  qrCodeId: z.uuid("Invalid QR Code."),
});

export type ScanAttendanceInput = z.infer<
  typeof scanAttendanceSchema
>;