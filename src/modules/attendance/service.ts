import { AppError } from "../../utils/error";

import { AttendanceRepository } from "./repository";
import type { ScanAttendanceDto } from "./types";

import { getSocket } from "../../services/socket";

const MAX_DAILY_SERVINGS = 3;

export class AttendanceService {
  private readonly repository =
    new AttendanceRepository();

  // =========================================
  // SCAN QR CODE
  // =========================================
  // This ONLY identifies the staff and their
  // selected meal.
  //
  // It does NOT create attendance.
  // =========================================

  async scanQRCode(data: ScanAttendanceDto) {
    // -----------------------------------------
    // 1. FIND STAFF
    // -----------------------------------------

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

    // -----------------------------------------
    // 2. CHECK STAFF STATUS
    // -----------------------------------------

    if (!staff.isActive) {
      throw new AppError(
        403,
        "This staff account is inactive.",
      );
    }

    // -----------------------------------------
    // 3. FIND TODAY'S MEAL SELECTION
    // -----------------------------------------

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

    // -----------------------------------------
    // 4. COUNT TODAY'S SERVINGS
    // -----------------------------------------

    const servedCount =
      await this.repository.countStaffScansToday(
        staff.id,
      );

    // -----------------------------------------
    // 5. CHECK DAILY LIMIT
    // -----------------------------------------

    if (servedCount >= MAX_DAILY_SERVINGS) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has already received the maximum of ${MAX_DAILY_SERVINGS} meal servings for today.`,
      );
    }

    // -----------------------------------------
    // 6. CALCULATE REMAINING
    // -----------------------------------------

    const remainingServings =
      MAX_DAILY_SERVINGS - servedCount;

    // -----------------------------------------
    // 7. RETURN PREVIEW
    // -----------------------------------------

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
        remainingServings,
        maxDailyServings: MAX_DAILY_SERVINGS,
      },
    };
  }


  // =========================================
  // SERVE MEAL
  // =========================================
  // This is called ONLY after the staff member
  // has been identified and the chef clicks
  // "Mark as Eaten".
  // =========================================

 async serveMeal(staffId: string) {

  // =========================================
  // 1. FIND STAFF
  // =========================================

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


  // =========================================
  // 2. CHECK STAFF STATUS
  // =========================================

  if (!staff.isActive) {
    throw new AppError(
      403,
      "This staff account is inactive.",
    );
  }


  // =========================================
  // 3. FIND TODAY'S MEAL
  // =========================================

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


  // =========================================
  // 4. ATOMICALLY CREATE SERVING
  // =========================================

  const result =
    await this.repository.createAttendanceIfAvailable(
      staff.id,
    );


  // =========================================
  // 5. MAXIMUM REACHED
  // =========================================

  if (!result.created) {
    throw new AppError(
      409,
      `${staff.firstName} ${staff.lastName} has already received the maximum of 3 meal servings for today.`,
    );
  }


  // =========================================
  // 6. SOCKET.IO EVENT
  // =========================================

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
      id:
        mealSelection.foodOption.id,

      name:
        mealSelection.foodOption.name,

      image:
        mealSelection.foodOption.image,
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


  // =========================================
  // 7. RETURN RESULT
  // =========================================

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
      id:
        mealSelection.foodOption.id,

      name:
        mealSelection.foodOption.name,

      image:
        mealSelection.foodOption.image,
    },

    attendance: {
      id:
        result.attendance.id,

      scannedAt:
        result.attendance.scannedAt,

      servingNumber:
        result.servedCount,

      servedCount:
        result.servedCount,

      remainingServings:
        result.remainingServings,

      maxDailyServings: 3,
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
    const staff =
      await this.repository.findStaffAttendance(
        staffId,
      );

    if (!staff.length) {
      throw new AppError(
        404,
        "No attendance record found for this staff.",
      );
    }

    return staff;
  }
}