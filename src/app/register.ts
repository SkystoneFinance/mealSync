import { FastifyInstance } from "fastify";
import corsPlugin from "../plugins/cors";
import swaggerPlugin from "../plugins/swagger";
import prismaPlugin from "../plugins/prisma";
import socketPlugin from "../plugins/socket";

export async function register(app: FastifyInstance) {
  await app.register(corsPlugin);

  await app.register(swaggerPlugin);

  await app.register(prismaPlugin);

  await app.register(socketPlugin);
}