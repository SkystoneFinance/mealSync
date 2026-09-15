import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/error";

import {
  MealSelectionRepository,
} from "./repository";

export class MealSelectionService {
  private readonly repo =
    new MealSelectionRepository();

  async create(
    staffId: string,
    foodOptionId: string,
    mealDateString: string,
  ) {
    const mealDate =
      new Date(mealDateString);

    if (
      Number.isNaN(
        mealDate.getTime(),
      )
    ) {
      throw new AppError(
        400,
        "Invalid meal date",
      );
    }

    const foodOption =
      await this.getFoodOption(
        foodOptionId,
      );

    if (!foodOption.isActive) {
      throw new AppError(
        400,
        "This food option is not active",
      );
    }

    const existing =
      await this.repo.findByStaffAndDate(
        staffId,
        mealDate,
      );

    if (existing) {
      throw new AppError(
        409,
        "You have already selected a meal for this day",
      );
    }

    return this.repo.create({
      staffId,
      foodOptionId,
      mealDate,
    });
  }

  async getByStaff(staffId: string) {
    return this.repo.findByStaff(
      staffId,
    );
  }

  async getByStaffAndDate(
    staffId: string,
    mealDateString: string,
  ) {
    const mealDate =
      new Date(mealDateString);

    if (
      Number.isNaN(
        mealDate.getTime(),
      )
    ) {
      throw new AppError(
        400,
        "Invalid meal date",
      );
    }

    return this.repo.findByStaffAndDate(
      staffId,
      mealDate,
    );
  }

  async getById(id: string) {
    const selection =
      await this.repo.findById(id);

    if (!selection) {
      throw new AppError(
        404,
        "Meal selection not found",
      );
    }

    return selection;
  }

  async update(
    id: string,
    foodOptionId: string,
  ) {
    await this.getById(id);

    const foodOption =
      await this.getFoodOption(
        foodOptionId,
      );

    if (!foodOption.isActive) {
      throw new AppError(
        400,
        "This food option is not active",
      );
    }

    return this.repo.update(
      id,
      foodOptionId,
    );
  }

  async delete(id: string) {
    await this.getById(id);

    return this.repo.delete(id);
  }

  private async getFoodOption(
    foodOptionId: string,
  ) {
    const foodOption =
      await prisma.foodOption.findUnique({
        where: {
          id: foodOptionId,
        },
      });

    if (!foodOption) {
      throw new AppError(
        404,
        "Food option not found",
      );
    }

    return foodOption;
  }
}