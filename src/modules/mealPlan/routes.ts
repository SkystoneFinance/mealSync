import type { FastifyInstance } from "fastify";

import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

import { MealPlanController } from "./controller";

const controller = new MealPlanController();

type WeekParams = { Params: { weekStart: string } };

// =========================================
// STAFF: /api/v1/meal-plan
// =========================================

export async function staffMealPlanRoutes(
  app: FastifyInstance,
) {
  app.addHook("preHandler", authenticate);

  // A week's menu, my choices and submission status
  // (?weekStart=YYYY-MM-DD, default next week; past weeks read-only)
  app.get<{ Querystring: { weekStart?: string } }>(
    "/",
    controller.getMyPlan.bind(controller),
  );

  // Next week and the week after: published / open / submitted
  app.get("/status", controller.getMyStatus.bind(controller));

  // Submit or edit my plan for an open week
  app.put("/", controller.submitMyPlan.bind(controller));
}

// =========================================
// CHEF / ADMIN: /api/v1/menu-weeks
// =========================================

export async function menuWeekRoutes(
  app: FastifyInstance,
) {
  app.addHook("preHandler", authenticate);
  app.addHook(
    "preHandler",
    authorize("ADMIN", "SUPER_ADMIN"),
  );

  // Next week's publish/close status (dashboard banners)
  app.get("/status", controller.status.bind(controller));

  app.get<WeekParams>(
    "/:weekStart",
    controller.getWeek.bind(controller),
  );

  app.put<WeekParams>(
    "/:weekStart/closed-days",
    controller.setClosedDays.bind(controller),
  );

  app.post<WeekParams>(
    "/:weekStart/publish",
    controller.publish.bind(controller),
  );

  // Let one staff member who missed the deadline choose (admins only)
  app.post<WeekParams>(
    "/:weekStart/reopen",
    { preHandler: authorize("SUPER_ADMIN") },
    controller.reopen.bind(controller),
  );

  app.get<WeekParams>(
    "/:weekStart/summary",
    controller.summary.bind(controller),
  );

  app.get<WeekParams>(
    "/:weekStart/summary/export",
    controller.exportSummary.bind(controller),
  );
}
