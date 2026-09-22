import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/error";

import {
  MealSelectionRepository,
} from "./repository";

export class MealSelectionService {
  private readonly repo =
    new MealSelectionRepository();


  // =========================================
  // CHECK IF MEAL DATE CAN STILL BE EDITED
  // =========================================

  private validateMealDateIsEditable(
    mealDate: Date,
  ) {
    const now = new Date();

    const today = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const selectedDate = new Date(
      mealDate.getFullYear(),
      mealDate.getMonth(),
      mealDate.getDate(),
    );


    // Today and all past dates are locked
    if (selectedDate <= today) {
      throw new AppError(
        400,
        "Meal selection is locked for this date",
      );
    }
  }


  // =========================================
  // CREATE MEAL SELECTION
  // =========================================

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


    // 🔒 CHECK DATE LOCK
    this.validateMealDateIsEditable(
      mealDate,
    );


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


  // =========================================
  // GET STAFF SELECTIONS
  // =========================================

  async getByStaff(
    staffId: string,
  ) {

    return this.repo.findByStaff(
      staffId,
    );

  }


  // =========================================
  // GET STAFF SELECTION BY DATE
  // =========================================

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


  // =========================================
  // GET SELECTION BY ID
  // =========================================

  async getById(
    id: string,
  ) {

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


  // =========================================
  // UPDATE MEAL SELECTION
  // =========================================

  async update(
    id: string,
    foodOptionId: string,
  ) {

    const selection =
      await this.getById(id);


    // 🔒 CHECK THE DATE OF THE EXISTING
    // SELECTION BEFORE ALLOWING CHANGE

    this.validateMealDateIsEditable(
      selection.mealDate,
    );


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


  // =========================================
  // DELETE MEAL SELECTION
  // =========================================

  async delete(
    id: string,
  ) {

    const selection =
      await this.getById(id);


    // 🔒 ALSO PREVENT DELETING
    // TODAY'S / PAST SELECTION

    this.validateMealDateIsEditable(
      selection.mealDate,
    );


    return this.repo.delete(id);

  }


  // =========================================
  // GET FOOD OPTION
  // =========================================

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