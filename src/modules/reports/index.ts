import type { FastifyInstance } from "fastify";

import { reportRoutes } from "./routes";

export default async function reportModule(
  app: FastifyInstance,
) {
  app.register(reportRoutes, {
    prefix: "/reports",
  });
}