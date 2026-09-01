import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { validate } from "../../plugins/zod";

import {
  activateStaffSchema,
  verifyStaffOtpSchema,
} from "./schema";

import {
  StaffAuthService,
} from "./service";

import type {
  ActivateStaffDto,
  VerifyStaffOtpDto,
} from "./types";


export class StaffAuthController {

  private readonly service =
    new StaffAuthService();


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
        body.phoneNumber,
      );


    return reply.status(200).send({

      success: true,

      message:
        result.message,

    });

  }


  async verifyOtp(

    request: FastifyRequest<{
      Body: VerifyStaffOtpDto;
    }>,

    reply: FastifyReply,

  ) {

    const body =
      await validate(
        verifyStaffOtpSchema,
        request.body,
      );


    const staff =
      await this.service.verifyOtp(
        body.staffNumber,
        body.phoneNumber,
        body.code,
      );


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
} 