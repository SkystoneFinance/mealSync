import { prisma } from "../../config/prisma";

export class StaffAuthRepository {

  findStaffByNumber(staffNumber: string) {
    return prisma.staff.findUnique({
      where: {
        staffNumber,
      },
    });
  }

  findStaffByPhone(phoneNumber: string) {
    return prisma.staff.findUnique({
      where: {
        phoneNumber,
      },
    });
  }

  updatePhoneNumber(
    staffId: string,
    phoneNumber: string,
  ) {
    return prisma.staff.update({
      where: {
        id: staffId,
      },
      data: {
        phoneNumber,
      },
    });
  }

  createOtp(data: {
    staffId: string;
    code: string;
    expiresAt: Date;
  }) {
    return prisma.staffOtp.create({
      data,
    });
  }

  findValidOtp(
    staffId: string,
    code: string,
  ) {
    return prisma.staffOtp.findFirst({
      where: {
        staffId,
        code,
        verifiedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  markOtpVerified(id: string) {
    return prisma.staffOtp.update({
      where: {
        id,
      },
      data: {
        verifiedAt: new Date(),
      },
    });
  }
}