import { startOfDay } from "date-fns";

import { prisma } from "../../config/prisma";

export class DashboardRepository {
  async getDashboardStats() {
    const [
      totalStaff,
      activeStaff,
      inactiveStaff,
      mealsServedToday,
    ] = await Promise.all([
      prisma.staff.count(),
      prisma.staff.count({
        where: {
          isActive: true,
        },
      }),
      prisma.staff.count({
        where: {
          isActive: false,
        },
      }),
      prisma.attendance.count({
        where: {
          mealDate: {
            gte: startOfDay(new Date()),
          },
        },
      }),
    ]);

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      mealsServedToday,
    };
  }

  async getRecentAttendance(limit = 10) {
    return prisma.attendance.findMany({
      where: {
        mealDate: {
          gte: startOfDay(new Date()),
        },
      },
      include: {
        staff: true,
      },
      orderBy: {
        scannedAt: "desc",
      },
      take: limit,
    });
  }

  async getDepartmentSummary() {
    const departments = await prisma.staff.groupBy({
      by: ["department"],
      _count: {
        department: true,
      },
      orderBy: {
        department: "asc",
      },
    });

    return departments.map((item) => ({
      department: item.department,
      total: item._count.department,
    }));
  }
}