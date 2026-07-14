import type { FastifyReply } from "fastify";

export function success(
  reply: FastifyReply,
  data: unknown,
  message = "Success"
) {
  return reply.send({
    success: true,
    message,
    data,
  });
}

export function failure(
  reply: FastifyReply,
  message: string,
  status = 400
) {
  return reply.status(status).send({
    success: false,
    message,
  });
}