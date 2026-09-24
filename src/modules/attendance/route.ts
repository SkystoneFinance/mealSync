import type { FastifyInstance } from "fastify";

import { AttendanceController } from "./controller";

export async function attendanceRoutes(
  app: FastifyInstance,
) {
  const controller =
    new AttendanceController();

  // Scan QR
  app.post(
    "/scan",
    controller.scanQRCode.bind(controller),
  );

  // Mark meal as eaten / served
  app.post(
    "/serve",
    controller.serveMeal.bind(controller),
  );

  // Today's attendance
  app.get(
    "/today",
    controller.todayAttendance.bind(controller),
  );

  // Attendance history
  app.get(
    "/history",
    controller.attendanceHistory.bind(controller),
  );

  // Staff attendance
  app.get(
    "/staff/:staffId",
    controller.staffAttendance.bind(controller),
  );
}