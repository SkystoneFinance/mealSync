import { FastifyInstance } from "fastify";
import multipart from "@fastify/multipart";
import corsPlugin from "../plugins/cors";
import swaggerPlugin from "../plugins/swagger";
import prismaPlugin from "../plugins/prisma";
import socketPlugin from "../plugins/socket";
import staffModule from "../modules/staff";
import reportModule from "../modules/reports";
import dashboardModule from "../modules/dashboard";
import attendanceModule from "../modules/attendance";
import sensiblePlugin from "../plugins/sensible";
import errorHandler from "../plugins/error-handler";

export async function register(app: FastifyInstance) {
  await app.register(corsPlugin);
  await app.register(swaggerPlugin);
  await app.register(prismaPlugin);

  await app.register(multipart);

  await app.register(socketPlugin);

  await app.register(sensiblePlugin);

  await app.register(errorHandler);
  
  await app.register(staffModule, {
    prefix: "/api/v1",
  });

  await app.register(attendanceModule, {
  prefix: "/api/v1",
});
  await app.register(dashboardModule, {
  prefix: "/api/v1",
});
  await app.register(reportModule, {
  prefix: "/api/v1",
});
}