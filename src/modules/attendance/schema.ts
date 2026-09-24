import { z } from "zod";

export const scanAttendanceSchema = z.object({
  qrCodeId: z.uuid("Invalid QR Code."),
});

export const serveAttendanceSchema = z.object({
  staffId: z.uuid("Invalid staff ID."),
});

export type ScanAttendanceInput = z.infer<
  typeof scanAttendanceSchema
>;

export type ServeAttendanceInput = z.infer<
  typeof serveAttendanceSchema
>;