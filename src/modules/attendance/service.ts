import { AppError } from "../../utils/error";
import { getSocket } from "../../services/socket";

import { AttendanceRepository } from "./repository";
import {
  MAX_DAILY_SERVINGS,
} from "./constants";

import type {
  ScanAttendanceDto,
} from "./types";

export class AttendanceService {
  private readonly repository =
    new AttendanceRepository();

  // =========================================
  // SCAN QR — PREVIEW ONLY
  // =========================================

  async scanQRCode(
    data: ScanAttendanceDto,
  ) {
    const staff =
      await this.repository.findStaffByQrCodeId(
        data.qrCodeId,
      );

    if (!staff) {
      throw new AppError(
        404,
        "Invalid QR Code.",
      );
    }

    if (!staff.isActive) {
      throw new AppError(
        403,
        "This staff account is inactive.",
      );
    }

    const mealSelection =
      await this.repository.findTodayMealSelection(
        staff.id,
      );

    if (!mealSelection) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has not selected a meal for today.`,
      );
    }

    const servedCount =
      await this.repository.countStaffServingsToday(
        staff.id,
      );

    if (
      servedCount >=
      MAX_DAILY_SERVINGS
    ) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has already received the maximum of ${MAX_DAILY_SERVINGS} meal servings for today.`,
      );
    }

    return {
      staff: {
        id: staff.id,
        staffNumber: staff.staffNumber,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
        qrImage: staff.qrImage,
      },

      meal: {
        id: mealSelection.foodOption.id,
        name: mealSelection.foodOption.name,
        image: mealSelection.foodOption.image,
      },

      serving: {
        servedCount,
        remainingServings:
          MAX_DAILY_SERVINGS -
          servedCount,
        maxDailyServings:
          MAX_DAILY_SERVINGS,
      },
    };
  }

  // =========================================
  // SERVE MEAL — CREATES ATTENDANCE
  // =========================================

  async serveMeal(staffId: string) {
    const staff =
      await this.repository.findStaffById(
        staffId,
      );

    if (!staff) {
      throw new AppError(
        404,
        "Staff member not found.",
      );
    }

    if (!staff.isActive) {
      throw new AppError(
        403,
        "This staff account is inactive.",
      );
    }

    const mealSelection =
      await this.repository.findTodayMealSelection(
        staff.id,
      );

    if (!mealSelection) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has not selected a meal for today.`,
      );
    }

    const result =
      await this.repository
        .createAttendanceIfAvailable(
          staff.id,
        );

    if (!result.created) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has already received the maximum of ${MAX_DAILY_SERVINGS} meal servings for today.`,
      );
    }

    const io = getSocket();

    io.emit("attendance:new", {
      attendanceId:
        result.attendance.id,

      staff: {
        id: staff.id,
        staffNumber: staff.staffNumber,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
      },

      meal: {
        id: mealSelection.foodOption.id,
        name: mealSelection.foodOption.name,
        image: mealSelection.foodOption.image,
      },

      servingNumber:
        result.servedCount,

      servedCount:
        result.servedCount,

      remainingServings:
        result.remainingServings,

      scannedAt:
        result.attendance.scannedAt,
    });

    return {
      staff: {
        id: staff.id,
        staffNumber: staff.staffNumber,
        firstName: staff.firstName,
        lastName: staff.lastName,
        department: staff.department,
        qrImage: staff.qrImage,
      },

      meal: {
        id: mealSelection.foodOption.id,
        name: mealSelection.foodOption.name,
        image: mealSelection.foodOption.image,
      },

      attendance: {
        id: result.attendance.id,
        scannedAt:
          result.attendance.scannedAt,
        servingNumber:
          result.servedCount,
        servedCount:
          result.servedCount,
        remainingServings:
          result.remainingServings,
        maxDailyServings:
          MAX_DAILY_SERVINGS,
      },
    };
  }

  // =========================================
  // TODAY
  // =========================================

  async getTodayAttendance() {
    return this.repository.findTodayAttendance();
  }

  // =========================================
  // HISTORY
  // =========================================

  async getAttendanceHistory() {
    return this.repository.findAttendanceHistory();
  }

  // =========================================
  // STAFF ATTENDANCE
  // =========================================

  async getStaffAttendance(
    staffId: string,
  ) {
    const attendance =
      await this.repository.findStaffAttendance(
        staffId,
      );

    if (!attendance.length) {
      throw new AppError(
        404,
        "No attendance record found for this staff.",
      );
    }

    return attendance;
  }
}