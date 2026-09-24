import {
  addDays,
  startOfDay,
} from "date-fns";

import {
  Prisma,
} from "@prisma/client";

import { prisma } from "../../config/prisma";
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

  // =========================================
  // COUNT TODAY'S SERVINGS
  // =========================================

  async countStaffServingsToday(staffId: string) {
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
            const today = startOfDay(
              new Date(),
            );

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

  // =========================================
  // RECENT ATTENDANCE
  // =========================================

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