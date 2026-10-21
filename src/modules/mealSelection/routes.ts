import type { FastifyInstance } from "fastify";

import { MealSelectionController } from "./controller";

import { authenticate } from "../../middleware/auth";

const controller =
  new MealSelectionController();

export async function mealSelectionRoutes(
  app: FastifyInstance,
) {
  // Creating, changing and deleting selections now happens only
  // through PUT /meal-plan (weekly submission window). The old
  // per-day write endpoints were removed.

  // =========================================
  // GET MY MEAL SELECTIONS
  // =========================================

  app.get(
    "/my",
    {
      preHandler: authenticate,
    },
    controller.findMySelections.bind(
      controller,
    ),
  );

  // =========================================
  // GET MY SELECTION FOR A DATE
  // =========================================

  app.get<{
    Querystring: {
      date: string;
    };
  }>(
    "/my/date",
    {
      preHandler: authenticate,
    },
    controller.findMySelectionByDate.bind(
      controller,
    ),
  );
}
