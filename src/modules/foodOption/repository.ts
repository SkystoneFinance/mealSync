import { prisma } from "../../config/prisma";

export class FoodOptionRepository {

  create(data: {
    name: string;
    image: string;
    mealDate: Date;
  }) {

    return prisma.foodOption.create({

      data,

    });

  }


  findAll() {

    return prisma.foodOption.findMany({

      orderBy: [
        {
          mealDate: "asc",
        },

        {
          createdAt: "asc",
        },
      ],

    });

  }


  findById(id: string) {

    return prisma.foodOption.findUnique({

      where: {
        id,
      },

    });

  }


  findByDate(mealDate: Date) {

    return prisma.foodOption.findMany({

      where: {
        mealDate,
        isActive: true,
      },

      orderBy: {
        createdAt: "asc",
      },

    });

  }


  update(
    id: string,

    data: {
      name?: string;
      image?: string;
      mealDate?: Date;
    },

  ) {

    return prisma.foodOption.update({

      where: {
        id,
      },

      data,

    });

  }


  updateStatus(
    id: string,
    isActive: boolean,
  ) {

    return prisma.foodOption.update({

      where: {
        id,
      },

      data: {
        isActive,
      },

    });

  }


  delete(id: string) {

    return prisma.foodOption.delete({

      where: {
        id,
      },

    });

  }

}