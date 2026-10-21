import type { FastifyInstance } from "fastify";

import { DashboardController } from "./controller";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const controller = new DashboardController();

export async function dashboardRoutes(
  app: FastifyInstance,
) {

  // Every route below: logged-in ADMIN or SUPER_ADMIN only
  app.addHook("preHandler", authenticate);
  app.addHook(
    "preHandler",
    authorize("ADMIN", "SUPER_ADMIN"),
  );
  app.get(
    "/",
    controller.getDashboard.bind(controller),
  );

  app.get(
    "/recent-attendance",
    controller.getRecentAttendance.bind(controller),
  );
}