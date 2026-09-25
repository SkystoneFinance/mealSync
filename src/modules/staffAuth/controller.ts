import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { validate } from "../../plugins/zod";

import {
  activateStaffSchema,
  staffLoginSchema,
} from "./schema";

import {
  StaffAuthService,
} from "./service";

import type {
  ActivateStaffDto,
  StaffLoginDto,
} from "./types";


export class StaffAuthController {

  private readonly service =
    new StaffAuthService();


  // ==========================================
  // FIRST-TIME ACTIVATION
  // ==========================================

  async activate(

    request: FastifyRequest<{
      Body: ActivateStaffDto;
    }>,

    reply: FastifyReply,

  ) {

    const body =
      await validate(
        activateStaffSchema,
        request.body,
      );


    const result =
      await this.service.activate(
        body.staffNumber,
        body.pin,
      );


    return reply.status(200).send({

      success: true,

      message:
        result.message,

    });
  }


  // ==========================================
  // STAFF LOGIN
  // ==========================================

  async login(

    request: FastifyRequest<{
      Body: StaffLoginDto;
    }>,

    reply: FastifyReply,

  ) {

    const body =
      await validate(
        staffLoginSchema,
        request.body,
      );


    const staff =
      await this.service.login(
        body.staffNumber,
        body.pin,
      );


    // ----------------------------------------
    // CREATE JWT
    // ----------------------------------------

    const token =
      request.server.jwt.sign({

        id: staff.id,

        staffId: staff.id,

        role: "USER",

        staffNumber:
          staff.staffNumber,

        firstName:
          staff.firstName,

        lastName:
          staff.lastName,

      });


    return reply.send({

      success: true,

      message:
        "Staff login successful.",

      token,

      user: {

        id: staff.id,

        staffId: staff.id,

        staffNumber:
          staff.staffNumber,

        firstName:
          staff.firstName,

        lastName:
          staff.lastName,

        department:
          staff.department,

        role: "USER",

      },

    });
  }


  // ==========================================
  // CURRENT STAFF PROFILE
  // ==========================================

  async me(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const user =
      request.user as {
        staffId?: string;
        id: string;
        role: string;
      };


    const staffId =
      user.staffId ?? user.id;


    const profile =
      await this.service.getProfile(
        staffId,
      );


    return reply.send({

      success: true,

      data: profile,

    });
  }
}