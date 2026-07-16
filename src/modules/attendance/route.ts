import type { FastifyInstance } from "fastify";

import { AttendanceController } from "./controller";

export async function attendanceRoutes(
  app: FastifyInstance,
) {
  const controller = new AttendanceController();

  app.post(
    "/scan",
    controller.scanQRCode.bind(controller),
  );

  app.get(
    "/today",
    controller.todayAttendance.bind(controller),
  );

  app.get(
    "/history",
    controller.attendanceHistory.bind(controller),
  );

  app.get(
    "/staff/:staffId",
    controller.staffAttendance.bind(controller),
  );
}