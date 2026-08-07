import { FastifyReply, FastifyRequest } from "fastify";

export function authorize(...roles: string[]) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    const user = request.user as any;

    if (!roles.includes(user.role)) {
      return reply.status(403).send({
        success: false,
        message: "Forbidden",
      });
    }
  };
}