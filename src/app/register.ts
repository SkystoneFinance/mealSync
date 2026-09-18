import { FastifyInstance } from "fastify";

import multipart from "@fastify/multipart";

import corsPlugin from "../plugins/cors";
import swaggerPlugin from "../plugins/swagger";
import prismaPlugin from "../plugins/prisma";
import socketPlugin from "../plugins/socket";
import staffModule from "../modules/staff";
import reportModule from "../modules/reports";

import {
  mealSelectionRoutes,
} from "../modules/mealSelection/routes";

import {
  staffAuthRoutes,
} from "../modules/staffAuth";

import dashboardModule from "../modules/dashboard";

import {
  foodOptionRoutes,
} from "../modules/foodOption";

import authModule from "../modules/auth";
import attendanceModule from "../modules/attendance";
import sensiblePlugin from "../plugins/sensible";
import errorHandler from "../plugins/error-handler";
import jwtPlugin from "../plugins/jwt";


export async function register(
  app: FastifyInstance,
) {

  await app.register(corsPlugin);

  await app.register(swaggerPlugin);

  await app.register(prismaPlugin);

  await app.register(jwtPlugin);

  await app.register(multipart);

  await app.register(socketPlugin);

  await app.register(sensiblePlugin);

  await app.register(errorHandler);

  await app.register(
    staffModule,
    {
      prefix: "/api/v1",
    },
  );
  await app.register(
    attendanceModule,
    {
      prefix: "/api/v1",
    },
  );
  await app.register(
    dashboardModule,
    {
      prefix: "/api/v1",
    },
  );
  await app.register(
    reportModule,
    {
      prefix: "/api/v1",
    },
  );
  await app.register(
    staffAuthRoutes,
    {
      prefix: "/api/v1/staff-auth",
    },
  );
  await app.register(
    mealSelectionRoutes,
    {
      prefix: "/api/v1/meal-selections",
    },
  );
  await app.register(
    foodOptionRoutes,
    {
      prefix: "/api/v1/food-options",
    },
  );
  await app.register(
    authModule,
    {
      prefix: "/api/v1",
    },
  );

}