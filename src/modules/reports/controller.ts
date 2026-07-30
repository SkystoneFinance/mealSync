import type { FastifyReply, FastifyRequest } from "fastify";

import { ReportService } from "./service";

const service = new ReportService();

export class ReportController {
  async today(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const report = await service.getTodayReport();

    return reply.code(200).send(report);
  }

  async weekly(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const report = await service.getWeeklyReport();

    return reply.code(200).send(report);
  }

  async monthly(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const report = await service.getMonthlyReport();

    return reply.code(200).send(report);
  }

  async departments(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const report =
      await service.getDepartmentReport();

    return reply.code(200).send(report);
  }

  async staffSummary(
 request:FastifyRequest,
 reply:FastifyReply
){

 const {period="today"}=request.query as {

   period?:
   "today"|
   "weekly"|
   "monthly";

 };


  const data=

  await service.getStaffSummary(period);


  return reply.send({

    success:true,

    data

  });

  }

}