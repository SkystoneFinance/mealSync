import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { validate } from "../../middleware/validation";

import { AttendanceService } from "./service";
import { scanAttendanceSchema } from "./schema";
import type { ScanAttendanceDto } from "./types";

export class AttendanceController {
  private readonly service =
    new AttendanceService();


  // =========================================
  // SCAN QR
  // =========================================

  async scanQRCode(
    request: FastifyRequest<{
      Body: ScanAttendanceDto;
    }>,
    reply: FastifyReply,
  ) {
    const body =
      await validate(
        scanAttendanceSchema,
        request.body,
      );

    const result =
      await this.service.scanQRCode(
        body,
      );

    return reply.send({
      success: true,
      message:
        "Staff and meal identified successfully.",
      data: result,
    });
  }


  // =========================================
  // SERVE MEAL
  // =========================================

  async serveMeal(
    request: FastifyRequest<{
      Body: {
        staffId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const result =
      await this.service.serveMeal(
        request.body.staffId,
      );

    return reply.status(201).send({
      success: true,
      message:
        "Meal serving recorded successfully.",
      data: result,
    });
  }


  // =========================================
  // TODAY
  // =========================================

  async todayAttendance(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const attendance =
      await this.service.getTodayAttendance();

    return reply.send({
      success: true,
      data: attendance,
    });
  }


  // =========================================
  // HISTORY
  // =========================================

  async attendanceHistory(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const history =
      await this.service.getAttendanceHistory();

    return reply.send({
      success: true,
      data: history,
    });
  }


  // =========================================
  // STAFF
  // =========================================

  async staffAttendance(
    request: FastifyRequest<{
      Params: {
        staffId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const attendance =
      await this.service.getStaffAttendance(
        request.params.staffId,
      );

    return reply.send({
      success: true,
      data: attendance,
    });
  }
}