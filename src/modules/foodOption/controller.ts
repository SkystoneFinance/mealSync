import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { validate } from "../../plugins/zod";

import {
  createFoodOptionSchema,
  updateFoodOptionSchema,
  updateFoodOptionStatusSchema,
} from "./schema";

import {
  FoodOptionService,
} from "./service";

import type {
  CreateFoodOptionDto,
  UpdateFoodOptionDto,
} from "./types";


export class FoodOptionController {

  private readonly service =
    new FoodOptionService();


  async create(

    request: FastifyRequest<{
      Body: CreateFoodOptionDto;
    }>,

    reply: FastifyReply,

  ) {

    const body =
      await validate(
        createFoodOptionSchema,
        request.body,
      );


    const result =
      await this.service.create(body);


    return reply
      .status(201)
      .send({

        success: true,

        message:
          "Food option created successfully.",

        data: result,

      });

  }


  async findAll(

    _request: FastifyRequest,

    reply: FastifyReply,

  ) {

    const result =
      await this.service.getAll();


    return reply.send({

      success: true,

      data: result,

    });

  }


  async findByDate(

    request: FastifyRequest<{
      Querystring: {
        date: string;
      };
    }>,

    reply: FastifyReply,

  ) {

    const result =
      await this.service.getByDate(
        request.query.date,
      );


    return reply.send({

      success: true,

      data: result,

    });

  }


  async findById(

    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,

    reply: FastifyReply,

  ) {

    const result =
      await this.service.getById(
        request.params.id,
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

      Body: UpdateFoodOptionDto;
    }>,

    reply: FastifyReply,

  ) {

    const body =
      await validate(
        updateFoodOptionSchema,
        request.body,
      );


    const result =
      await this.service.update(
        request.params.id,
        body,
      );


    return reply.send({

      success: true,

      message:
        "Food option updated successfully.",

      data: result,

    });

  }

  async updateStatus(

  request: FastifyRequest<{
    Params: {
      id: string;
    };

    Body: {
      isActive: boolean;
    };
  }>,

  reply: FastifyReply,

) {

  const body =
    await validate(
      updateFoodOptionStatusSchema,
      request.body,
    );


  const result =
    await this.service.updateStatus(

      request.params.id,

      body.isActive,

    );


  return reply.send({

    success: true,

    message:
      "Food option status updated.",

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
        "Food option deleted successfully.",

    });

  }

  async findSummaryByDate(
  request: FastifyRequest<{
    Querystring: {
      date: string;
    };
  }>,
  reply: FastifyReply,
) {
  const result =
    await this.service.getSummaryByDate(
      request.query.date,
    );

  return reply.send({
    success: true,
    data: result,
  });
}

}