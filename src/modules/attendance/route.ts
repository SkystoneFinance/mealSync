import type { FastifyInstance } from "fastify";

import { AttendanceController } from "./controller";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

export async function attendanceRoutes(
  app: FastifyInstance,
) {

  // Every route below: logged-in ADMIN or SUPER_ADMIN only
  app.addHook("preHandler", authenticate);
  app.addHook(
    "preHandler",
    authorize("ADMIN", "SUPER_ADMIN"),
  );
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