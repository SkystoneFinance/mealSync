export interface CreateMealSelectionDto {
  foodOptionId: string;
  mealDate: string;
}

export interface UpdateMealSelectionDto {
  foodOptionId: string;
}

export interface MealSelectionResponse {
  id: string;
  staffId: string;
  foodOptionId: string;
  mealDate: Date;
  createdAt: Date;
  updatedAt: Date;
}