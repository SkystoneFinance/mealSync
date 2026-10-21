import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  MealSelectionService,
} from "./service";

// Read-only. Submitting a weekly plan lives in the mealPlan module.
export class MealSelectionController {
  private readonly service =
    new MealSelectionService();

  async findMySelections(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const user =
      request.user as {
        staffId?: string;
        id: string;
      };

    const staffId =
      user.staffId ?? user.id;

    const result =
      await this.service.getByStaff(
        staffId,
      );

    return reply.send({
      success: true,
      data: result,
    });
  }

  async findMySelectionByDate(
    request: FastifyRequest<{
      Querystring: {
        date: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const user =
      request.user as {
        staffId?: string;
        id: string;
      };

    const staffId =
      user.staffId ?? user.id;

    const result =
      await this.service.getByStaffAndDate(
        staffId,
        request.query.date,
      );

    return reply.send({
      success: true,
      data: result,
    });
  }
}
