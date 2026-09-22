import { AppError } from "../../utils/error";

import { AttendanceRepository } from "./repository";
import type { ScanAttendanceDto } from "./types";

import { getSocket } from "../../services/socket";

export class AttendanceService {
  private readonly repository =
    new AttendanceRepository();

  async scanQRCode(data: ScanAttendanceDto) {
    // =========================================
    // 1. FIND STAFF FROM QR CODE
    // =========================================

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


    // =========================================
    // 2. FIND TODAY'S MEAL SELECTION
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
    // 3. COUNT TODAY'S SCANS
    // =========================================

    const scanCount =
      await this.repository.countStaffScansToday(
        staff.id,
      );


    // =========================================
    // 4. ENFORCE 3-SCAN DAILY LIMIT
    // =========================================

    const MAX_DAILY_SCANS = 3;

    if (scanCount >= MAX_DAILY_SCANS) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has reached the maximum of 3 scans for today.`,
      );
    }


    // =========================================
    // 5. RECORD ATTENDANCE
    // =========================================

    const attendance =
      await this.repository.createAttendance(
        staff.id,
      );


    // =========================================
    // 6. CALCULATE SCAN INFORMATION
    // =========================================

    const scanNumber =
      scanCount + 1;

    const remainingScans =
      MAX_DAILY_SCANS - scanNumber;


    // =========================================
    // 7. SOCKET.IO EVENT
    // =========================================

    const io = getSocket();

    io.emit("attendance:new", {
      attendanceId: attendance.id,

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

      scanNumber,
      remainingScans,

      scannedAt: attendance.scannedAt,
    });


    // =========================================
    // 8. RETURN SCAN RESULT
    // =========================================

    return {
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

      attendance: {
        id: attendance.id,
        scannedAt: attendance.scannedAt,
        scanNumber,
        remainingScans,
      },
    };
  }


  async getTodayAttendance() {
    return this.repository.findTodayAttendance();
  }


  async getAttendanceHistory() {
    return this.repository.findAttendanceHistory();
  }


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