import type { FastifyInstance } from "fastify";

import { MealSelectionController } from "./controller";

import { authenticate } from "../../middleware/auth";

const controller =
  new MealSelectionController();

export async function mealSelectionRoutes(
  app: FastifyInstance,
) {
  // =========================================
  // CREATE MEAL SELECTION
  // =========================================

  app.post<{
    Body: {
      foodOptionId: string;
      mealDate: string;
    };
  }>(
    "/",
    {
      preHandler: authenticate,
    },
    controller.create.bind(controller),
  );

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

  // =========================================
  // UPDATE SELECTION
  // =========================================

  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      foodOptionId: string;
    };
  }>(
    "/:id",
    {
      preHandler: authenticate,
    },
    controller.update.bind(controller),
  );

  // =========================================
  // DELETE SELECTION
  // =========================================

  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      preHandler: authenticate,
    },
    controller.delete.bind(controller),
  );
}