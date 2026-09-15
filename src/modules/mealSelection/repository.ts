import { prisma } from "../../config/prisma";

export class MealSelectionRepository {
  async create(data: {
    staffId: string;
    foodOptionId: string;
    mealDate: Date;
  }) {
    return prisma.mealSelection.create({
      data,
      include: {
        foodOption: true,
      },
    });
  }

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

  async findById(id: string) {
    return prisma.mealSelection.findUnique({
      where: {
        id,
      },
      include: {
        foodOption: true,
      },
    });
  }

  async update(
    id: string,
    foodOptionId: string,
  ) {
    return prisma.mealSelection.update({
      where: {
        id,
      },
      data: {
        foodOptionId,
      },
      include: {
        foodOption: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.mealSelection.delete({
      where: {
        id,
      },
    });
  }
}