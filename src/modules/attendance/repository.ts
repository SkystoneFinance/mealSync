import { addDays } from "date-fns";

import {
  Prisma,
} from "@prisma/client";

import { prisma } from "../../config/prisma";
import { businessToday } from "../mealPlan/schedule";
import { MAX_DAILY_SERVINGS } from "./constants";

const staffSelect = {
  id: true,
  staffNumber: true,
  firstName: true,
  lastName: true,
  department: true,
  qrImage: true,
  isActive: true,
} as const;

export class AttendanceRepository {
  // =========================================
  // FIND STAFF BY QR CODE
  // =========================================

  async findStaffByQrCodeId(qrCodeId: string) {
    return prisma.staff.findUnique({
      where: {
        qrCodeId,
      },
      select: staffSelect,
    });
  }

  // =========================================
  // FIND STAFF BY ID
  // =========================================

  async findStaffById(staffId: string) {
    return prisma.staff.findUnique({
      where: {
        id: staffId,
      },
      select: staffSelect,
    });
  }

  // =========================================
  // FIND TODAY'S MEAL SELECTION
  // =========================================

  async findTodayMealSelection(staffId: string) {
    const today = businessToday();

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

  // =========================================
  // COUNT TODAY'S SERVINGS
  // =========================================

  async countStaffServingsToday(staffId: string) {
    const today = businessToday();

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

  // =========================================
  // ATOMICALLY CREATE SERVING
  // =========================================

  async createAttendanceIfAvailable(
    staffId: string,
  ) {
    let attempt = 0;
    const MAX_RETRIES = 3;

    while (attempt < MAX_RETRIES) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const today = businessToday();

            const servedCount =
              await tx.attendance.count({
                where: {
                  staffId,
                  mealDate: {
                    gte: today,
                    lt: addDays(today, 1),
                  },
                },
              });

            if (
              servedCount >=
              MAX_DAILY_SERVINGS
            ) {
              return {
                created: false as const,
                servedCount,
                remainingServings: 0,
                attendance: null,
              };
            }

            const attendance =
              await tx.attendance.create({
                data: {
                  staffId,

                  // Date only.
                  mealDate: today,
                },

                include: {
                  staff: {
                    select: staffSelect,
                  },
                },
              });

            const newServedCount =
              servedCount + 1;

            const remainingServings =
              MAX_DAILY_SERVINGS -
              newServedCount;

            return {
              created: true as const,
              servedCount: newServedCount,
              remainingServings,
              attendance,
            };
          },
          {
            isolationLevel:
              Prisma.TransactionIsolationLevel
                .Serializable,
            maxWait: 5000,
            timeout: 10000,
          },
        );
      } catch (error) {
        if (
          error instanceof
            Prisma.PrismaClientKnownRequestError &&
          error.code === "P2034"
        ) {
          attempt++;

          if (attempt >= MAX_RETRIES) {
            throw error;
          }

          await new Promise((resolve) =>
            setTimeout(
              resolve,
              50 * attempt,
            ),
          );

          continue;
        }

        throw error;
      }
    }

    throw new Error(
      "Unable to safely record meal attendance.",
    );
  }

  // =========================================
  // TODAY'S ATTENDANCE
  // =========================================

  async findTodayAttendance() {
    const today = businessToday();

    const attendance = await prisma.attendance.findMany({
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

    // Attendance has no link to the dish; it's the staff member's
    // selection for the same day
    const selections = await prisma.mealSelection.findMany({
      where: {
        mealDate: today,
        staffId: {
          in: [...new Set(attendance.map((a) => a.staffId))],
        },
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

  // =========================================
  // ATTENDANCE HISTORY
  // =========================================

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

  // =========================================
  // STAFF ATTENDANCE
  // =========================================

  async findStaffAttendance(
    staffId: string,
  ) {
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

  // =========================================
  // TODAY'S TOTAL
  // =========================================

  async countToday() {
    const today = businessToday();

    return prisma.attendance.count({
      where: {
        mealDate: {
          gte: today,
          lt: addDays(today, 1),
        },
      },
    });
  }

  // =========================================
  // RECENT ATTENDANCE
  // =========================================

  async findRecent(limit = 10) {
    const today = businessToday();

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