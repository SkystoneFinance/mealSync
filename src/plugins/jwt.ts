import fp from "fastify-plugin";
import jwt from "@fastify/jwt";

import { SESSION_TTL } from "../modules/auth/tokens";

export default fp(async (app) => {
  const secret = process.env.JWT_SECRET;

  // Never fall back to a default: anyone who has seen the code could forge tokens.
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Refusing to start.",
    );
  }

  app.register(jwt, {
    secret,
    sign: {
      expiresIn: SESSION_TTL,
    },
  });
});
