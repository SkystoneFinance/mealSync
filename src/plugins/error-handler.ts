import fp from "fastify-plugin";
import { AppError } from "../utils/error";

export default fp(async (app) => {
  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  });
});