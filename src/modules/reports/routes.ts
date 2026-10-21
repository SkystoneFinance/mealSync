import type { FastifyInstance } from "fastify";

import { ReportController } from "./controller";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const controller = new ReportController();

export async function reportRoutes(
  app: FastifyInstance,
) {

  // Every route below: logged-in ADMIN or SUPER_ADMIN only
  app.addHook("preHandler", authenticate);
  app.addHook(
    "preHandler",
    authorize("ADMIN", "SUPER_ADMIN"),
  );
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

  app.get(
    "/export",
    controller.export.bind(controller),
  );
}