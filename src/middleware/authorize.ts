import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import type { Role } from "@prisma/client";


interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}


export function authorize(
  ...roles: Role[]
) {

  return async (
    request: FastifyRequest,
    reply: FastifyReply,
  ) => {

    const user =
      request.user as AuthenticatedUser;


    if (!roles.includes(user.role)) {

      return reply.status(403).send({

        success: false,

        message: "Forbidden",

      });

    }

  };

}