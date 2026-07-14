import fp from "fastify-plugin";
import { Server } from "socket.io";

export default fp(async (app) => {
  const io = new Server(app.server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  app.decorate("io", io);
});