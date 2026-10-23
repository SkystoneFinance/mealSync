import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/error";

// Forgotten PINs. PINs are one-way hashes, so they can't be read back:
// an administrator clears the PIN and the staff member chooses a new one
// through "Activate your account" on the sign-in page.

const staffSelect = {
  id: true,
  staffNumber: true,
  firstName: true,
  lastName: true,
  department: true,
} as const;

export class PinResetService {
  // Public, from the sign-in page. Always answers the same way so it can't
  // be used to find out which staff numbers exist.
  async request(staffNumber: string) {
    const staff = await prisma.staff.findUnique({
      where: { staffNumber: staffNumber.trim().toUpperCase() },
      include: { user: { select: { password: true } } },
    });

    if (staff?.isActive && staff.user?.password) {
      const open = await prisma.pinResetRequest.findFirst({
        where: { staffId: staff.id, resolvedAt: null },
      });

      // One open request per person is enough
      if (!open) {
        await prisma.pinResetRequest.create({
          data: { staffId: staff.id },
        });
      }
    }

    return {
      message:
        "Your request has been sent. An administrator will reset your PIN, then use \"Activate your account\" to choose a new one.",
    };
  }

  async listOpen() {
    return prisma.pinResetRequest.findMany({
      where: { resolvedAt: null },
      include: { staff: { select: staffSelect } },
      orderBy: { createdAt: "asc" },
    });
  }

  // Clear the PIN; the staff member re-activates with a new one
  async resetPin(staffId: string, adminId: string) {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: true },
    });

    if (!staff) {
      throw new AppError(404, "Staff not found.");
    }

    if (!staff.user?.password) {
      throw new AppError(
        409,
        `${staff.firstName} has no PIN yet. They can set one with "Activate your account".`,
      );
    }

    const now = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: staff.user.id },
        data: { password: null },
      }),
      prisma.pinResetRequest.updateMany({
        where: { staffId, resolvedAt: null },
        data: {
          resolvedAt: now,
          resolvedById: adminId,
          resolution: "reset",
        },
      }),
    ]);

    return {
      message: `${staff.firstName}'s PIN was reset. Ask them to choose a new one with "Activate your account" now.`,
    };
  }

  async dismiss(requestId: string, adminId: string) {
    const result = await prisma.pinResetRequest.updateMany({
      where: { id: requestId, resolvedAt: null },
      data: {
        resolvedAt: new Date(),
        resolvedById: adminId,
        resolution: "dismissed",
      },
    });

    if (!result.count) {
      throw new AppError(404, "Request not found or already handled.");
    }

    return { message: "Request dismissed." };
  }
}
