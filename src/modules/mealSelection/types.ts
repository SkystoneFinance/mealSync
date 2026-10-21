export interface MealSelectionResponse {
  id: string;
  staffId: string;
  foodOptionId: string | null;
  noMeal: boolean;
  mealDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
