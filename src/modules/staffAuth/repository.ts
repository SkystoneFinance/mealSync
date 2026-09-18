import { prisma } from "../../config/prisma";


export class StaffAuthRepository {

  // ===============================
  // STAFF
  // ===============================

  findStaffByNumber(
    staffNumber: string,
  ) {

    return prisma.staff.findUnique({

      where: {
        staffNumber,
      },

    });

  }


  findStaffByPhone(
    phoneNumber: string,
  ) {

    return prisma.staff.findUnique({

      where: {
        phoneNumber,
      },

    });

  }

  findStaffById(staffId: string) {
    return prisma.staff.findUnique({
      where: {
        id: staffId,
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


  // ===============================
  // OTP
  // ===============================

  async invalidatePreviousOtps(
    staffId: string,
  ) {

    return prisma.staffOtp.updateMany({

      where: {

        staffId,

        verifiedAt: null,

      },

      data: {

        // Mark old OTPs as no longer usable
        verifiedAt: new Date(),

      },

    });

  }


  createOtp(
    data: {

      staffId: string;

      code: string;

      expiresAt: Date;

    },
  ) {

    return prisma.staffOtp.create({

      data,

    });

  }


  findLatestValidOtp(
    staffId: string,
  ) {

    return prisma.staffOtp.findFirst({

      where: {

        staffId,

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


  markOtpVerified(
    id: string,
  ) {

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