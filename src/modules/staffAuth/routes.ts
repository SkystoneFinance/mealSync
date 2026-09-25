import type {
  FastifyInstance,
} from "fastify";

import {
  StaffAuthController,
} from "./controller";

import {
  authenticate,
} from "../../middleware/auth";


const controller =
  new StaffAuthController();


export async function staffAuthRoutes(
  app: FastifyInstance,
) {

  // ==========================================
  // CURRENT STAFF PROFILE
  // ==========================================

  app.get(
    "/me",

    {
      preHandler: [
        authenticate,
      ],
    },

    controller.me.bind(controller),
  );


  // ==========================================
  // FIRST-TIME ACTIVATION
  // ==========================================

  app.post(
    "/activate",

    controller.activate.bind(
      controller,
    ),
  );


  // ==========================================
  // STAFF LOGIN
  // ==========================================

  app.post(
    "/login",

    controller.login.bind(
      controller,
    ),
  );
}