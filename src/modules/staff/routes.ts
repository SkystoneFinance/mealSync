import type { FastifyInstance } from "fastify";

import { StaffController } from "./controller";
import { authenticate } from "../../middleware/role";

const controller = new StaffController();

export async function staffRoutes(
  app: FastifyInstance,
) {
  app.post(
    "/",
    controller.create.bind(controller),
  );

  // ⭐ NEW IMPORT ROUTE
  app.post(
    "/import",
    controller.importStaff.bind(controller),
  );

  app.get(
    "/",
    controller.findAll.bind(controller),
  );

  app.get(
  "/me",
  {
    preHandler: [authenticate],
  },
  controller.me.bind(controller),
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