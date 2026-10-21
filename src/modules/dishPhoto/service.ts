import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/error";
import { businessToday } from "../mealPlan/schedule";

// Our own dish photos replace pasted outside image URLs over time.
// A photo belongs to a dish *name*, so one photo of "Jollof rice" serves
// every past and future menu entry called that.

export const PHOTO_PATH_PREFIX = "/api/v1/dish-photos/";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // the app resizes photos well below this

// "Fried rice & Chicken " → "fried rice and chicken"
export function dishNameKey(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Image value stored on FoodOption.image; the version busts browser caches
export function photoImagePath(photo: { id: string; updatedAt: Date }) {
  return `${PHOTO_PATH_PREFIX}${photo.id}/image?v=${photo.updatedAt.getTime()}`;
}

export function isOwnPhoto(image: string) {
  return image.startsWith(PHOTO_PATH_PREFIX);
}

export class DishPhotoService {
  async findForName(name: string) {
    return prisma.dishPhoto.findUnique({
      where: { nameKey: dishNameKey(name) },
      select: { id: true, updatedAt: true },
    });
  }

  async getImage(id: string) {
    const photo = await prisma.dishPhoto.findUnique({
      where: { id },
      select: { data: true, mimeType: true },
    });

    if (!photo) {
      throw new AppError(404, "Photo not found.");
    }

    return photo;
  }

  // Save a photo for a dish and point every menu entry with the same
  // name at it.
  async upload(
    foodOptionId: string,
    file: { mimetype: string; buffer: Buffer },
    userId: string,
  ) {
    const option = await prisma.foodOption.findUnique({
      where: { id: foodOptionId },
    });

    if (!option) {
      throw new AppError(404, "Food option not found.");
    }

    // A real photo can only exist once the dish has been cooked
    if (option.mealDate > businessToday()) {
      throw new AppError(
        400,
        "You can add a photo on the day the dish is served.",
      );
    }

    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new AppError(400, "Upload a JPEG, PNG or WebP photo.");
    }

    if (file.buffer.length > MAX_PHOTO_BYTES) {
      throw new AppError(400, "That photo is too large (max 3 MB).");
    }

    const nameKey = dishNameKey(option.name);
    const data = new Uint8Array(file.buffer);

    const photo = await prisma.dishPhoto.upsert({
      where: { nameKey },
      create: {
        nameKey,
        mimeType: file.mimetype,
        data,
        uploadedById: userId,
      },
      update: {
        mimeType: file.mimetype,
        data,
        uploadedById: userId,
      },
      select: { id: true, updatedAt: true },
    });

    // Names are free text, so match on the normalised key in code
    const all = await prisma.foodOption.findMany({
      select: { id: true, name: true },
    });

    const ids = all
      .filter((o) => dishNameKey(o.name) === nameKey)
      .map((o) => o.id);

    await prisma.foodOption.updateMany({
      where: { id: { in: ids } },
      data: { image: photoImagePath(photo) },
    });

    return prisma.foodOption.findUnique({
      where: { id: foodOptionId },
    });
  }

  // For the chef's prompt and the transition progress
  async status() {
    const today = businessToday();

    const [todays, upcoming] = await Promise.all([
      prisma.foodOption.findMany({
        where: { mealDate: today, isActive: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.foodOption.findMany({
        where: { mealDate: { gte: today } },
        select: { image: true },
      }),
    ]);

    return {
      today: todays.map((o) => ({
        id: o.id,
        name: o.name,
        image: o.image,
        hasOwnPhoto: isOwnPhoto(o.image),
      })),
      upcoming: {
        total: upcoming.length,
        ownPhotos: upcoming.filter((o) => isOwnPhoto(o.image)).length,
      },
    };
  }
}
