import type { FastifyInstance } from "fastify";

import { DashboardController } from "./controller";

const controller = new DashboardController();

export async function dashboardRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/",
    controller.getDashboard.bind(controller),
  );

  app.get(
    "/recent-attendance",
    controller.getRecentAttendance.bind(controller),
  );

  app.get(
    "/department-summary",
    controller.getDepartmentSummary.bind(controller),
  );
}