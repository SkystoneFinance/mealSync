import type { FastifyReply, FastifyRequest } from "fastify";

import { validate } from "../../middleware/validation";

import { AttendanceService } from "./service";
import { scanAttendanceSchema } from "./schema";
import type { ScanAttendanceDto } from "./types";

export class AttendanceController {
  private readonly service = new AttendanceService();

  async scanQRCode(
    request: FastifyRequest<{
      Body: ScanAttendanceDto;
    }>,
    reply: FastifyReply,
  ) {
    const body = await validate(
      scanAttendanceSchema,
      request.body,
    );

    const attendance = await this.service.scanQRCode(body);

    return reply.status(201).send({
      success: true,
      message: "Attendance recorded successfully.",
      data: attendance,
    });
  }

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