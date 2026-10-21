import type { FastifyInstance } from "fastify";

import { StaffController } from "./controller";
import type { CreateStaffDto, UpdateStaffDto } from "./types";
import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";

const controller = new StaffController();

// Staff management is SUPER_ADMIN only
const superAdminOnly = [
  authenticate,
  authorize("SUPER_ADMIN"),
];

export async function staffRoutes(
  app: FastifyInstance,
) {
  app.post<{ Body: CreateStaffDto }>(
    "/",
    { preHandler: superAdminOnly },
    controller.create.bind(controller),
  );

  // ⭐ NEW IMPORT ROUTE
  app.post(
    "/import",
    { preHandler: superAdminOnly },
    controller.importStaff.bind(controller),
  );

  app.get(
    "/",
    { preHandler: superAdminOnly },
    controller.findAll.bind(controller),
  );

  app.get(
  "/me",
  {
    preHandler: [authenticate],
  },
  controller.me.bind(controller),
);

  app.get<{ Params: { id: string } }>(
    "/:id",
    { preHandler: superAdminOnly },
    controller.findById.bind(controller),
  );

  app.patch<{ Params: { id: string }; Body: UpdateStaffDto }>(
    "/:id",
    { preHandler: superAdminOnly },
    controller.update.bind(controller),
  );

  app.delete<{ Params: { id: string } }>(
    "/:id",
    { preHandler: superAdminOnly },
    controller.delete.bind(controller),
  );
}