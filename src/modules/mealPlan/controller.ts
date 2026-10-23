import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { validate } from "../../plugins/zod";
import { AppError } from "../../utils/error";

import { parseWeekStart } from "./schedule";
import {
  closedDaysSchema,
  reopenSchema,
  submitPlanSchema,
} from "./schema";
import { MealPlanService } from "./service";

type WeekParams = { Params: { weekStart: string } };

export class MealPlanController {
  private readonly service = new MealPlanService();

  private staffIdFrom(request: FastifyRequest) {
    const staffId = request.user.staffId;

    if (!staffId) {
      throw new AppError(
        403,
        "Only staff accounts can submit a meal plan.",
      );
    }

    return staffId;
  }

  // =========================================
  // STAFF
  // =========================================

  async getMyPlan(
    request: FastifyRequest<{
      Querystring: { weekStart?: string };
    }>,
    reply: FastifyReply,
  ) {
    const { weekStart } = request.query;

    const data = await this.service.getStaffPlan(
      this.staffIdFrom(request),
      weekStart ? parseWeekStart(weekStart) : undefined,
    );

    return reply.send({ success: true, data });
  }

  async getMyStatus(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const data = await this.service.getStaffStatus(
      this.staffIdFrom(request),
    );

    return reply.send({ success: true, data });
  }

  async submitMyPlan(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = await validate(
      submitPlanSchema,
      request.body,
    );

    const data = await this.service.submitStaffPlan(
      this.staffIdFrom(request),
      body.weekStart,
      body.selections,
    );

    return reply.send({
      success: true,
      message: "Your meal plan has been submitted.",
      data,
    });
  }

  // =========================================
  // CHEF / ADMIN
  // =========================================

  async status(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const data = await this.service.getChefStatus();

    return reply.send({ success: true, data });
  }

  async getWeek(
    request: FastifyRequest<WeekParams>,
    reply: FastifyReply,
  ) {
    const data = await this.service.getWeek(
      parseWeekStart(request.params.weekStart),
    );

    return reply.send({ success: true, data });
  }

  async setClosedDays(
    request: FastifyRequest<WeekParams>,
    reply: FastifyReply,
  ) {
    const body = await validate(
      closedDaysSchema,
      request.body,
    );

    const data = await this.service.setClosedDays(
      parseWeekStart(request.params.weekStart),
      body.dates,
    );

    return reply.send({ success: true, data });
  }

  async publish(
    request: FastifyRequest<WeekParams>,
    reply: FastifyReply,
  ) {
    const data = await this.service.publish(
      parseWeekStart(request.params.weekStart),
      request.user.id,
    );

    return reply.send({
      success: true,
      message: "Menu published. Staff can now choose their meals.",
      data,
    });
  }

  async reopen(
    request: FastifyRequest<WeekParams>,
    reply: FastifyReply,
  ) {
    const body = await validate(reopenSchema, request.body);

    const data = await this.service.reopenForStaff(
      parseWeekStart(request.params.weekStart),
      body.staffId,
      request.user.id,
    );

    return reply.send({ success: true, message: data.message, data });
  }

  async summary(
    request: FastifyRequest<WeekParams>,
    reply: FastifyReply,
  ) {
    const data = await this.service.getSummary(
      parseWeekStart(request.params.weekStart),
    );

    return reply.send({ success: true, data });
  }

  async exportSummary(
    request: FastifyRequest<WeekParams>,
    reply: FastifyReply,
  ) {
    const { weekStart } = request.params;

    const buffer = await this.service.exportSummary(
      parseWeekStart(weekStart),
    );

    return reply
      .header(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      )
      .header(
        "Content-Disposition",
        `attachment; filename="MealSync-Meal-Prep-${weekStart}.xlsx"`,
      )
      .send(Buffer.from(buffer));
  }
}
