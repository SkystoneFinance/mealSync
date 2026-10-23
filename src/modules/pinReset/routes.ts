import type { FastifyInstance } from "fastify";

import { z } from "zod";

import { authenticate } from "../../middleware/auth";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../plugins/zod";

import { PinResetService } from "./service";

const service = new PinResetService();

const requestSchema = z.object({
  staffNumber: z.string().trim().min(1, "Enter your staff number."),
});

// =========================================
// PUBLIC: /api/v1/staff-auth/pin-reset-request
// =========================================

export async function pinResetPublicRoutes(app: FastifyInstance) {
  app.post("/pin-reset-request", async (request, reply) => {
    const body = await validate(requestSchema, request.body);
    const data = await service.request(body.staffNumber);

    return reply.send({ success: true, ...data });
  });
}

// =========================================
// SUPER_ADMIN: under /api/v1/staff
// =========================================

export async function pinResetAdminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authenticate);
  app.addHook("preHandler", authorize("SUPER_ADMIN"));

  app.get("/pin-reset-requests", async (_request, reply) => {
    const data = await service.listOpen();
    return reply.send({ success: true, data });
  });

  app.post<{ Params: { id: string } }>(
    "/pin-reset-requests/:id/dismiss",
    async (request, reply) => {
      const data = await service.dismiss(request.params.id, request.user.id);
      return reply.send({ success: true, ...data });
    },
  );

  app.post<{ Params: { id: string } }>(
    "/:id/reset-pin",
    async (request, reply) => {
      const data = await service.resetPin(request.params.id, request.user.id);
      return reply.send({ success: true, ...data });
    },
  );
}
