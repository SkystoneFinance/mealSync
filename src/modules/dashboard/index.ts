import type { FastifyInstance } from "fastify";

import { dashboardRoutes } from "./routes";

export default async function dashboardModule(
  app: FastifyInstance,
) {
  app.register(dashboardRoutes, {
    prefix: "/dashboard",
  });
}