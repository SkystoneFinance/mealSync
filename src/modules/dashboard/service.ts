import { DashboardRepository } from "./repository";

export class DashboardService {
  private readonly repository = new DashboardRepository();

  async getDashboard() {
    const stats = await this.repository.getDashboardStats();

    return {
      ...stats,
      remainingStaff:
        stats.activeStaff - stats.mealsServedToday,
    };
  }

  async getRecentAttendance() {
    return this.repository.getRecentAttendance();
  }

  async getDepartmentSummary() {
    return this.repository.getDepartmentSummary();
  }
}