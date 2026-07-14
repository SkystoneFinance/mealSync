import fp from "fastify-plugin";

import { prisma } from "../config/prisma";

export default fp(async (app) => {
  await prisma.$connect();

  app.decorate("prisma", prisma);

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });
});