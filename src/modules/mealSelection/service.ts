import { AppError } from "../../utils/error";
import {
  MealSelectionRepository,
} from "./repository";

// Read-only. Selections are written by the mealPlan module
// (PUT /meal-plan) inside the weekly submission window.
export class MealSelectionService {
  private readonly repo =
    new MealSelectionRepository();

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
}
