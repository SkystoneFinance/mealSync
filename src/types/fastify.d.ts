import "fastify";
import "@fastify/jwt";
import { Server } from "socket.io";


declare module "fastify" {
  interface FastifyInstance {
    io: Server;
  }
}


declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;

      // Admin authentication
      email?: string;

      // Shared
      role: string;

      // Staff authentication
      staffId?: string;
      staffNumber?: string;
      firstName?: string;
      lastName?: string;
    };
  }
}


declare module "@fastify/jwt" {
  interface FastifyJWT {

    payload: {
      id: string;

      // Admin authentication
      email?: string;

      // Shared
      role: string;

      // Staff authentication
      staffId?: string;
      staffNumber?: string;
      firstName?: string;
      lastName?: string;
    };


    user: {
      id: string;

      // Admin authentication
      email?: string;

      // Shared
      role: string;

      // Staff authentication
      staffId?: string;
      staffNumber?: string;
      firstName?: string;
      lastName?: string;
    };

  }
}