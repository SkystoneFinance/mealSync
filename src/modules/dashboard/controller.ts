import type { FastifyReply, FastifyRequest } from "fastify";

import { DashboardService } from "./service";

export class DashboardController {
  private readonly service = new DashboardService();

  async getDashboard(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const dashboard = await this.service.getDashboard();

    return reply.send({
      success: true,
      data: dashboard,
    });
  }

  async getRecentAttendance(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const recentAttendance =
      await this.service.getRecentAttendance();

    return reply.send({
      success: true,
      data: recentAttendance,
    });
  }

  async getDepartmentSummary(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const departments =
      await this.service.getDepartmentSummary();

    return reply.send({
      success: true,
      data: departments,
    });
  }
}