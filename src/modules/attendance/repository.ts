import { addDays, startOfDay } from "date-fns";

import { prisma } from "../../config/prisma";

const staffSelect = {
  id: true,
  staffNumber: true,
  firstName: true,
  lastName: true,
  department: true,
  qrImage: true,
} as const;

export class AttendanceRepository {
  async findStaffByQrCodeId(qrCodeId: string) {
    return prisma.staff.findUnique({
      where: {
        qrCodeId,
      },
      select: staffSelect,
    });
  }

  async findTodayMealSelection(staffId: string) {
    const today = startOfDay(new Date());

    return prisma.mealSelection.findUnique({
      where: {
        staffId_mealDate: {
          staffId,
          mealDate: today,
        },
      },
      include: {
        foodOption: true,
      },
    });
  }

  async countStaffScansToday(staffId: string) {
    const today = startOfDay(new Date());

    return prisma.attendance.count({
      where: {
        staffId,
        mealDate: {
          gte: today,
          lt: addDays(today, 1),
        },
      },
    });
  }

  async createAttendance(staffId: string) {
    return prisma.attendance.create({
      data: {
        staffId,
        mealDate: new Date(),
      },
      include: {
        staff: {
          select: staffSelect,
        },
      },
    });
  }

  async findTodayAttendance() {
    const today = startOfDay(new Date());

    return prisma.attendance.findMany({
      where: {
        mealDate: {
          gte: today,
          lt: addDays(today, 1),
        },
      },
      include: {
        staff: {
          select: staffSelect,
        },
      },
      orderBy: {
        scannedAt: "desc",
      },
    });
  }

  async findAttendanceHistory() {
    return prisma.attendance.findMany({
      include: {
        staff: {
          select: staffSelect,
        },
      },
      orderBy: {
        scannedAt: "desc",
      },
    });
  }

  async findStaffAttendance(staffId: string) {
    return prisma.attendance.findMany({
      where: {
        staffId,
      },
      include: {
        staff: {
          select: staffSelect,
        },
      },
      orderBy: {
        scannedAt: "desc",
      },
    });
  }

  async countToday() {
    const today = startOfDay(new Date());

    return prisma.attendance.count({
      where: {
        mealDate: {
          gte: today,
          lt: addDays(today, 1),
        },
      },
    });
  }

  async findRecent(limit = 10) {
    const today = startOfDay(new Date());

    return prisma.attendance.findMany({
      where: {
        mealDate: {
          gte: today,
          lt: addDays(today, 1),
        },
      },
      include: {
        staff: {
          select: staffSelect,
        },
      },
      orderBy: {
        scannedAt: "desc",
      },
      take: limit,
    });
  }
}