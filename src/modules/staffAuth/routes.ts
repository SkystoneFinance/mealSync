import type {
  FastifyInstance,
} from "fastify";

import {
  StaffAuthController,
} from "./controller";


const controller =
  new StaffAuthController();


export async function staffAuthRoutes(
  app: FastifyInstance,
) {

  // First-time activation
  app.post(
    "/activate",
    controller.activate.bind(controller),
  );


  // Verify OTP + login
  app.post(
    "/verify-otp",
    controller.verifyOtp.bind(controller),
  );

}