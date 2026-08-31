import type { FastifyInstance } from "fastify";

import { FoodOptionController } from "./controller";

import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";


const controller = new FoodOptionController();


export async function foodOptionRoutes(
  app: FastifyInstance,
) {

  // =========================================
  // ADMIN + SUPER ADMIN
  // =========================================

  const adminAccess = [
    authenticate,
    authorize(
      "ADMIN",
      "SUPER_ADMIN",
    ),
  ];


  // =========================================
  // CREATE FOOD OPTION
  // =========================================

  app.post<{
    Body: any;
  }>(
    "/",
    {
      preHandler: adminAccess,
    },
    controller.create.bind(controller),
  );


  // =========================================
  // GET ALL FOOD OPTIONS
  // =========================================

  app.get(
    "/",
    {
      preHandler: authenticate,
    },
    controller.findAll.bind(controller),
  );


  // =========================================
  // GET FOOD OPTIONS BY DATE
  // =========================================

  app.get<{
    Querystring: {
      date: string;
    };
  }>(
    "/date",
    {
      preHandler: authenticate,
    },
    controller.findByDate.bind(controller),
  );


  // =========================================
  // GET FOOD OPTION BY ID
  // =========================================

  app.get<{
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      preHandler: authenticate,
    },
    controller.findById.bind(controller),
  );


  // =========================================
  // UPDATE FOOD OPTION
  // =========================================

  app.patch<{
    Params: {
      id: string;
    };
    Body: any;
  }>(
    "/:id",
    {
      preHandler: adminAccess,
    },
    controller.update.bind(controller),
  );


  // =========================================
  // UPDATE FOOD OPTION STATUS
  // =========================================

  app.patch<{
    Params: {
      id: string;
    };

    Body: {
      isActive: boolean;
    };
  }>(
    "/:id/status",
    {
      preHandler: adminAccess,
    },
    controller.updateStatus.bind(controller),
  );


  // =========================================
  // DELETE FOOD OPTION
  // =========================================

  app.delete<{
    Params: {
      id: string;
    };
  }>(
    "/:id",
    {
      preHandler: adminAccess,
    },
    controller.delete.bind(controller),
  );

}