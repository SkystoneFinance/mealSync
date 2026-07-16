import type { FastifyInstance } from "fastify";

import { staffRoutes } from "./routes";

export default async function staffModule(
  app: FastifyInstance,
) {
  app.register(staffRoutes, {
    prefix: "/staff",
  });
}