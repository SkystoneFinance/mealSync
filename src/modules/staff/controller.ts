import type { FastifyReply, FastifyRequest } from "fastify";
import { MultipartFile } from "@fastify/multipart";

import { StaffService } from "./service";
import type { CreateStaffDto, UpdateStaffDto } from "./types";
import { createStaffSchema, updateStaffSchema } from "./schema";
import { validate } from "../../plugins/zod";

export class StaffController {
  private readonly service = new StaffService();

  async create(
    request: FastifyRequest<{ Body: CreateStaffDto }>,
    reply: FastifyReply,
  ) {
    const body = await validate(
      createStaffSchema,
      request.body,
    );

    const result = await this.service.create(body);

    return reply.status(201).send({
      success: true,
      message: "Staff created successfully.",
      data: result,
    });
  }

  async findAll(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const staff = await this.service.getAll();

    return reply.send({
      success: true,
      data: staff,
    });
  }

  async findById(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    const staff = await this.service.getById(
      request.params.id,
    );

    return reply.send({
      success: true,
      data: staff,
    });
  }

  async update(
    request: FastifyRequest<{
      Params: { id: string };
      Body: UpdateStaffDto;
    }>,
    reply: FastifyReply,
  ) {
    const body = await validate(
      updateStaffSchema,
      request.body,
    );

    const staff = await this.service.update(
      request.params.id,
      body,
    );

    return reply.send({
      success: true,
      message: "Staff updated successfully.",
      data: staff,
    });
  }

  async delete(
    request: FastifyRequest<{
      Params: { id: string };
    }>,
    reply: FastifyReply,
  ) {
    await this.service.delete(request.params.id);

    return reply.send({
      success: true,
      message: "Staff deleted successfully.",
    });
  }

  async importStaff(
  request: FastifyRequest,
  reply: FastifyReply,
) {

  const file =
    await request.file();

  if (!file) {

    return reply.status(400).send({

      success:false,

      message:"Please upload an Excel file."

    });

  }

  const result =
    await this.service.importStaff(file);

  return reply.send({

    success:true,

    message:`${result.imported} staff imported successfully.`,

    data:result

  });

}

}