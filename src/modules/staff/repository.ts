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
    return prisma.staff.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
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

  async delete(id: string) {
    return prisma.staff.delete({
      where: {
        id,
      },
    });
  }
}