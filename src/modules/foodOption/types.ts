export interface CreateFoodOptionDto {
  name: string;
  image: string;
  mealDate: string;
}

export interface UpdateFoodOptionDto {
  name?: string;
  image?: string;
  mealDate?: string;
}

export interface FoodOptionResponse {
  id: string;
  name: string;
  image: string;
  mealDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}