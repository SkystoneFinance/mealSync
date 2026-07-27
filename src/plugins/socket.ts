import fp from "fastify-plugin";
import { Server } from "socket.io";
import { setSocket } from "../services/socket";

export default fp(async (app) => {
  const io = new Server(app.server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    app.log.info(`Socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
      app.log.info(`Socket disconnected: ${socket.id}`);
    });
  });

  setSocket(io);

  app.decorate("io", io);
});