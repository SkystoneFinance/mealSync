import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { validate } from "../../plugins/zod";

import {
  createMealSelectionSchema,
  updateMealSelectionSchema,
} from "./schema";

import {
  MealSelectionService,
} from "./service";

import type {
  CreateMealSelectionDto,
  UpdateMealSelectionDto,
} from "./types";

export class MealSelectionController {
  private readonly service =
    new MealSelectionService();

  async create(
    request: FastifyRequest<{
      Body: CreateMealSelectionDto;
    }>,
    reply: FastifyReply,
  ) {
    const body =
      await validate(
        createMealSelectionSchema,
        request.body,
      );

    const user =
      request.user as {
        staffId?: string;
        id: string;
        role: string;
      };

    const staffId =
      user.staffId ?? user.id;

    const result =
      await this.service.create(
        staffId,
        body.foodOptionId,
        body.mealDate,
      );

    return reply
      .status(201)
      .send({
        success: true,
        message:
          "Meal selected successfully.",
        data: result,
      });
  }

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

  async update(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
      Body: UpdateMealSelectionDto;
    }>,
    reply: FastifyReply,
  ) {
    const body =
      await validate(
        updateMealSelectionSchema,
        request.body,
      );

    const result =
      await this.service.update(
        request.params.id,
        body.foodOptionId,
      );

    return reply.send({
      success: true,
      message:
        "Meal selection updated successfully.",
      data: result,
    });
  }

  async delete(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    await this.service.delete(
      request.params.id,
    );

    return reply.send({
      success: true,
      message:
        "Meal selection deleted successfully.",
    });
  }
}