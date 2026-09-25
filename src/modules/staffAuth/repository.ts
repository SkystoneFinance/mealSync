import { prisma } from "../../config/prisma";


export class StaffAuthRepository {

  // ==========================================
  // STAFF
  // ==========================================

  findStaffByNumber(
    staffNumber: string,
  ) {
    return prisma.staff.findUnique({
      where: {
        staffNumber,
      },

      include: {
        user: true,
      },
    });
  }


  findStaffById(
    staffId: string,
  ) {
    return prisma.staff.findUnique({
      where: {
        id: staffId,
      },

      include: {
        user: true,
      },
    });
  }


  // ==========================================
  // UPDATE STAFF USER PASSWORD
  // ==========================================

  updateUserPassword(
    userId: string,
    hashedPassword: string,
  ) {
    return prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        password: hashedPassword,
      },
    });
  }


  // ==========================================
  // CREATE USER PASSWORD
  // ==========================================

  createUserForStaff(
    staffId: string,
    hashedPassword: string,
  ) {
    return prisma.user.create({
      data: {
        staffId,
        password: hashedPassword,
        role: "USER",
        isActive: true,
      },
    });
  }
}