import { businessToday } from "../mealPlan/schedule";

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
            gte: businessToday(),
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
    const today = businessToday();

    const attendance = await prisma.attendance.findMany({
      where: {
        mealDate: {
          gte: today,
        },
      },
      include: {
        staff: {
          select: {
            id: true,
            staffNumber: true,
            firstName: true,
            lastName: true,
            department: true,
          },
        },
      },
      orderBy: {
        scannedAt: "desc",
      },
      take: limit,
    });

    // The dish served = the staff member's selection for today
    const selections = await prisma.mealSelection.findMany({
      where: {
        mealDate: today,
        staffId: { in: attendance.map((a) => a.staffId) },
      },
      include: {
        foodOption: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    const mealByStaff = new Map(
      selections.map((s) => [s.staffId, s.foodOption]),
    );

    return attendance.map((a) => ({
      ...a,
      meal: mealByStaff.get(a.staffId) ?? null,
    }));
  }
}
