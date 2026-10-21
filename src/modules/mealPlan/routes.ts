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

  // Next week's menu, my choices and submission status
  app.get("/", controller.getMyPlan.bind(controller));

  // Submit or edit my plan for next week
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

  app.get<WeekParams>(
    "/:weekStart/summary",
    controller.summary.bind(controller),
  );

  app.get<WeekParams>(
    "/:weekStart/summary/export",
    controller.exportSummary.bind(controller),
  );
}
