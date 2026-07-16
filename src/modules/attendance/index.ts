import type { FastifyInstance } from "fastify";

import { attendanceRoutes } from "./route";

export default async function attendanceModule(
  app: FastifyInstance,
) {
  app.register(attendanceRoutes, {
    prefix: "/attendance",
  });
}