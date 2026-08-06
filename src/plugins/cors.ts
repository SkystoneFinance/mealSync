import fp from "fastify-plugin";
import cors from "@fastify/cors";

export default fp(async (app) => {
  await app.register(cors, {
    origin: [
      "http://localhost:5173",
      "https://sky-meal-sync.vercel.app",
    ],
    credentials: true,
  });
});