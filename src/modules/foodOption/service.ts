import { prisma } from "../../config/prisma";
import {
  DishPhotoService,
  isOwnPhoto,
  photoImagePath,
} from "../dishPhoto/service";
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

  private readonly photos =
    new DishPhotoService();


  async create(
    data: CreateFoodOptionDto,
  ) {

    const mealDate =
      new Date(data.mealDate);


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


    return this.repo.create({

      name: data.name,

      image: await this.resolveImage(
        data.name,
        data.image,
      ),

      mealDate,

    });

  }


  // Use our own photo for this dish name if we have one, otherwise the
  // pasted URL (outside URLs are being phased out as photos are taken)
  private async resolveImage(name: string, url?: string) {
    const photo = await this.photos.findForName(name);

    if (photo) {
      return photoImagePath(photo);
    }

    // A renamed dish loses the other dish's photo
    if (!url || isOwnPhoto(url)) {
      throw new AppError(
        400,
        "Add an image URL. You can replace it with a photo on the day.",
      );
    }

    return url;
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

    const existing = await this.getById(id);


    let mealDate:
      | Date
      | undefined;


    if (data.mealDate) {

      mealDate =
        new Date(data.mealDate);


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

    }


    return this.repo.update(
      id,
      {

        ...(data.name !== undefined && {
          name: data.name,
        }),

        // Our own photo (matched by name) always wins over a pasted URL
        ...((data.image !== undefined || data.name !== undefined) && {
          image: await this.resolveImage(
            data.name ?? existing.name,
            data.image ?? existing.image,
          ),
        }),

        ...(mealDate !== undefined && {
          mealDate,
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


    // Deleting would cascade-delete staff choices (and history)
    const chosenBy =
      await prisma.mealSelection.count({
        where: { foodOptionId: id },
      });

    if (chosenBy > 0) {
      throw new AppError(
        409,
        `This meal has been chosen by ${chosenBy} staff. Disable it instead of deleting.`,
      );
    }


    return this.repo.delete(id);

  }

  async getSummaryByDate(date: string) {
  const mealDate = new Date(date);

  if (Number.isNaN(mealDate.getTime())) {
    throw new AppError(
      400,
      "Invalid meal date",
    );
  }

  const options =
    await this.repo.findSummaryByDate(mealDate);

  const totalSelections = options.reduce(
    (total, option) =>
      total + option._count.selections,
    0,
  );

  return {
    date,
    totalSelections,
    options: options.map((option) => ({
      id: option.id,
      name: option.name,
      image: option.image,
      mealDate: option.mealDate,
      isActive: option.isActive,
      selectionCount: option._count.selections,
    })),
  };
}

}