import { ReportRepository } from "./repository";


// ===============================
// REPORT PERIOD TYPES
// ===============================

export type StaffSummaryPeriod =
  | "today"
  | "weekly"
  | "monthly";


export type ExportPeriod =
  | "today"
  | "current-week"
  | "previous-week"
  | "current-month"
  | "previous-month";


// ===============================
// REPORT SERVICE
// ===============================

export class ReportService {

  private readonly repository =
    new ReportRepository();


  // ===============================
  // TODAY
  // ===============================

  async getTodayReport() {

    return this.repository.getTodaySummary();

  }


  // ===============================
  // CURRENT WEEK SUMMARY
  // ===============================

  async getWeeklyReport() {

    return this.repository.getWeeklySummary();

  }


  // ===============================
  // CURRENT MONTH SUMMARY
  // ===============================

  async getMonthlyReport() {

    return this.repository.getMonthlySummary();

  }


  // ===============================
  // DEPARTMENT REPORT
  // ===============================

  async getDepartmentReport() {

    return this.repository.getDepartmentReport();

  }


  // ===============================
  // STAFF SUMMARY
  // ===============================

  async getStaffSummary(
    period: StaffSummaryPeriod,
  ) {

    return this.repository.getStaffSummary(
      period,
    );

  }


  // ===============================
  // EXCEL EXPORT
  // ===============================

  async exportReport(
    period: ExportPeriod,
  ) {

    return this.repository.exportReport(
      period,
    );

  }

}