import { prisma } from "../../config/prisma";

export class MealSelectionRepository {
  async findByStaffAndDate(
    staffId: string,
    mealDate: Date,
  ) {
    return prisma.mealSelection.findUnique({
      where: {
        staffId_mealDate: {
          staffId,
          mealDate,
        },
      },
      include: {
        foodOption: true,
      },
    });
  }

  async findByStaff(staffId: string) {
    return prisma.mealSelection.findMany({
      where: {
        staffId,
      },
      include: {
        foodOption: true,
      },
      orderBy: {
        mealDate: "asc",
      },
    });
  }
}