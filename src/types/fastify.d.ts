import "fastify";
import "@fastify/jwt";
import { Server } from "socket.io";

declare module "fastify" {   
  interface FastifyInstance {
    io: Server;
  }
}


declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      id: string;
      email: string;
      role: string;
    };

    user: {
      id: string;
      email: string;
      role: string;
    };
  }
}