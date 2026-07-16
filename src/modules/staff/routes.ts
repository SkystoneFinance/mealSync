import type { FastifyInstance } from "fastify";

import { StaffController } from "./controller";

const controller = new StaffController();

export async function staffRoutes(
  app: FastifyInstance,
) {
  app.post(
    "/",
    controller.create.bind(controller),
  );

  app.get(
    "/",
    controller.findAll.bind(controller),
  );

  app.get(
    "/:id",
    controller.findById.bind(controller),
  );

  app.patch(
    "/:id",
    controller.update.bind(controller),
  );

  app.delete(
    "/:id",
    controller.delete.bind(controller),
  );
}