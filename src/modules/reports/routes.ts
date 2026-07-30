import type { FastifyInstance } from "fastify";

import { ReportController } from "./controller";

const controller = new ReportController();

export async function reportRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/today",
    controller.today.bind(controller),
  );

  app.get(
    "/weekly",
    controller.weekly.bind(controller),
  );

  app.get(
    "/monthly",
    controller.monthly.bind(controller),
  );

  app.get(
    "/departments",
    controller.departments.bind(controller),
  );
  app.get(

"/staff-summary",

controller.staffSummary.bind(controller)

);
}