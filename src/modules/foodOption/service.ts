import { AppError } from "../../utils/error";

import {
  FoodOptionRepository,
} from "./repository";

import type {
  CreateFoodOptionDto,
  UpdateFoodOptionDto,
} from "./types";


export class FoodOptionService {

  private readonly repo =
    new FoodOptionRepository();


  async create(
    data: CreateFoodOptionDto,
  ) {

    const mealDate =
      new Date(data.mealDate);


    if (Number.isNaN(mealDate.getTime())) {

      throw new AppError(
        400,
        "Invalid meal date",
      );

    }


    return this.repo.create({

      name: data.name,

      image: data.image,

      mealDate,

    });

  }


  async getAll() {

    return this.repo.findAll();

  }


  async getById(id: string) {

    const food =
      await this.repo.findById(id);


    if (!food) {

      throw new AppError(
        404,
        "Food option not found",
      );

    }


    return food;

  }


  async getByDate(
    date: string,
  ) {

    const mealDate =
      new Date(date);


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


    return this.repo.findByDate(
      mealDate,
    );

  }


  async update(
    id: string,
    data: UpdateFoodOptionDto,
  ) {

    await this.getById(id);


    return this.repo.update(
      id,
      {

        ...(data.name && {
          name: data.name,
        }),

        ...(data.image && {
          image: data.image,
        }),

        ...(data.mealDate && {
          mealDate:
            new Date(data.mealDate),
        }),

      },
    );

  }


  async updateStatus(
    id: string,
    isActive: boolean,
  ) {

    await this.getById(id);


    return this.repo.updateStatus(
      id,
      isActive,
    );

  }


  async delete(id: string) {

    await this.getById(id);


    return this.repo.delete(id);

  }

}