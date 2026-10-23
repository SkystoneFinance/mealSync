import { prisma } from "../../config/prisma";
import type { CreateStaffDto, UpdateStaffDto } from "./types";

export class StaffRepository {
  async create(
    data: CreateStaffDto & {
      qrCodeId: string;
      qrImage: string;
    },
  ) {
    return prisma.staff.create({
      data,
    });
  }

  async findAll() {
    const staff = await prisma.staff.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: { select: { password: true } },
      },
    });

    // hasPin: has activated and can sign in (never expose the hash)
    return staff.map(({ user, ...s }) => ({
      ...s,
      hasPin: Boolean(user?.password),
    }));
  }

  async findByUserId(userId: string) {

  const user = await prisma.user.findUnique({

    where: {
      id: userId,
    },

    include: {
      staff: true,
    },

  });

  return user?.staff;

}

  async findById(id: string) {
    return prisma.staff.findUnique({
      where: {
        id,
      },
    });
  }

  async findByStaffNumber(staffNumber: string) {
    return prisma.staff.findUnique({
      where: {
        staffNumber,
      },
    });
  }

  async update(
    id: string,
    data: UpdateStaffDto,
  ) {
    return prisma.staff.update({
      where: {
        id,
      },
      data,
    });
  }

  async countTotal() {
  return prisma.staff.count();
}

async countInactive() {
  return prisma.staff.count({
    where: {
      isActive: false,
    },
  });
}

async countActive() {
  return prisma.staff.count({
    where: {
      isActive: true,
    },
  });
}

async countByDepartment() {
  return prisma.staff.groupBy({
    by: ["department"],
    _count: {
      department: true,
    },
    orderBy: {
      department: "asc",
    },
  });
}

  async delete(id: string) {
    return prisma.staff.delete({
      where: {
        id,
      },
    });
  }
}