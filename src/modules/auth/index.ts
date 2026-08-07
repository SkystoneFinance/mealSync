import { FastifyInstance } from "fastify";
import { authRoutes } from "./routes";

export default async function authModule(
  app: FastifyInstance,
) {
  app.register(authRoutes, {
    prefix: "/auth",
  });
}