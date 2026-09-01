import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  ReportService,
} from "./service";

import type {
  StaffSummaryPeriod,
  ExportPeriod,
} from "./service";


const service =
  new ReportService();


export class ReportController {

  // =========================
  // TODAY REPORT
  // =========================

  async today(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const report =
      await service.getTodayReport();

    return reply
      .code(200)
      .send(report);

  }


  // =========================
  // WEEKLY REPORT
  // =========================

  async weekly(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const report =
      await service.getWeeklyReport();

    return reply
      .code(200)
      .send(report);

  }


  // =========================
  // MONTHLY REPORT
  // =========================

  async monthly(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const report =
      await service.getMonthlyReport();

    return reply
      .code(200)
      .send(report);

  }


  // =========================
  // DEPARTMENT REPORT
  // =========================

  async departments(
    _request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const report =
      await service.getDepartmentReport();

    return reply
      .code(200)
      .send(report);

  }


  // =========================
  // STAFF SUMMARY
  // =========================

  async staffSummary(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const {
      period = "today",
    } = request.query as {
      period?: StaffSummaryPeriod;
    };


    const data =
      await service.getStaffSummary(
        period,
      );


    return reply.send({

      success: true,

      data,

    });

  }


  // =========================
  // EXPORT EXCEL REPORT
  // =========================

  async export(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {

    const {
      period = "current-week",
    } = request.query as {
      period?: ExportPeriod;
    };


    const file =
      await service.exportReport(
        period,
      );


    const fileNames: Record<
      ExportPeriod,
      string
    > = {

      today:
        "MealSync-Today.xlsx",

      "current-week":
        "MealSync-Present-Week.xlsx",

      "previous-week":
        "MealSync-Previous-Week.xlsx",

      "current-month":
        "MealSync-Present-Month.xlsx",

      "previous-month":
        "MealSync-Previous-Month.xlsx",

    };


    reply.header(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );


    reply.header(
      "Content-Disposition",
      `attachment; filename="${fileNames[period]}"`,
    );


    return reply.send(file);

  }

}