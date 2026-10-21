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

    // Fastify's own client errors (bad JSON, too large, ...) keep their 4xx
    const statusCode = (error as { statusCode?: number }).statusCode;

    if (statusCode && statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        success: false,
        message: (error as Error).message,
      });
    }

    return reply.status(500).send({
      success: false,
      message: "Internal Server Error",
    });
  });
});