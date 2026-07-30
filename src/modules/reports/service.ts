import { ReportRepository } from "./repository";

export class ReportService {
  private readonly repository = new ReportRepository();

  async getTodayReport() {
    return this.repository.getTodaySummary();
  }

  async getWeeklyReport() {
    return this.repository.getWeeklySummary();
  }

  async getMonthlyReport() {
    return this.repository.getMonthlySummary();
  }

  async getDepartmentReport() {
    return this.repository.getDepartmentReport();
  }

  async getStaffSummary(
  period:"today"|"weekly"|"monthly"
  ){

  return this.repository.getStaffSummary(period);
  }

}