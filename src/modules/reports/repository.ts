import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

import { prisma } from "../../config/prisma";

export class ReportRepository {
  async getTodaySummary() {
    const today = new Date();

    const totalStaff = await prisma.staff.count({
      where: {
        isActive: true,
      },
    });

    const served = await prisma.attendance.count({
      where: {
        mealDate: {
          gte: startOfDay(today),
          lte: endOfDay(today),
        },
      },
    });

    return {
      totalStaff,
      served,
      remaining: totalStaff - served,
      attendanceRate:
        totalStaff === 0
          ? 0
          : Number(((served / totalStaff) * 100).toFixed(2)),
    };
  }

  async getWeeklySummary() {
    const today = new Date();

    const totalStaff = await prisma.staff.count({
      where: {
        isActive: true,
      },
    });

    const served = await prisma.attendance.count({
      where: {
        mealDate: {
          gte: startOfWeek(today),
          lte: endOfWeek(today),
        },
      },
    });

    return {
      totalStaff,
      served,
      remaining: totalStaff - served,
      attendanceRate:
        totalStaff === 0
          ? 0
          : Number(((served / totalStaff) * 100).toFixed(2)),
    };
  }

  async getMonthlySummary() {
    const today = new Date();

    const totalStaff = await prisma.staff.count({
      where: {
        isActive: true,
      },
    });

    const served = await prisma.attendance.count({
      where: {
        mealDate: {
          gte: startOfMonth(today),
          lte: endOfMonth(today),
        },
      },
    });

    return {
      totalStaff,
      served,
      remaining: totalStaff - served,
      attendanceRate:
        totalStaff === 0
          ? 0
          : Number(((served / totalStaff) * 100).toFixed(2)),
    };
  }

  async getDepartmentReport() {
    const departments = await prisma.staff.groupBy({
      by: ["department"],
      _count: {
        department: true,
      },
    });

    return Promise.all(
      departments.map(async (dept) => {
        const served = await prisma.attendance.count({
          where: {
            staff: {
              department: dept.department,
            },
            mealDate: {
              gte: startOfDay(new Date()),
            },
          },
        });

        return {
          department: dept.department,
          totalStaff: dept._count.department,
          served,
          remaining: dept._count.department - served,
        };
      }),
    );
  }
}