import type {
  FastifyInstance,
} from "fastify";

import {
  FoodOptionController,
} from "./controller";

import {
  authenticate,
} from "../../middleware/authenticate";

import {
  authorize,
} from "../../middleware/authorize";


const controller =
  new FoodOptionController();


export async function foodOptionRoutes(
  app: FastifyInstance,
) {

  const adminAccess = [

    authenticate,

    authorize(
      "ADMIN",
      "SUPER_ADMIN",
    ),

  ];


  app.post(
    "/",
    {
      preHandler: adminAccess,
    },
    controller.create.bind(controller),
  );


  app.get(
    "/",
    {
      preHandler: [
        authenticate,
      ],
    },
    controller.findAll.bind(controller),
  );


  app.get(
    "/date",
    {
      preHandler: [
        authenticate,
      ],
    },
    controller.findByDate.bind(controller),
  );


  app.get(
    "/:id",
    {
      preHandler: [
        authenticate,
      ],
    },
    controller.findById.bind(controller),
  );


  app.patch(
    "/:id",
    {
      preHandler: adminAccess,
    },
    controller.update.bind(controller),
  );


  app.patch(
    "/:id/status",
    {
      preHandler: adminAccess,
    },
    controller.updateStatus.bind(controller),
  );


  app.delete(
    "/:id",
    {
      preHandler: adminAccess,
    },
    controller.delete.bind(controller),
  );

}