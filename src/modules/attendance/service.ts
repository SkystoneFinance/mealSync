import { AppError } from "../../utils/error";

import { AttendanceRepository } from "./repository";
import type { ScanAttendanceDto } from "./types";
import { getSocket } from "../../services/socket";

export class AttendanceService {
  private readonly repository = new AttendanceRepository();

  async scanQRCode(data: ScanAttendanceDto) {
    // Find the staff attached to the QR Code
    const staff = await this.repository.findStaffByQrCodeId(
      data.qrCodeId,
    );

    if (!staff) {
      throw new AppError(404, "Invalid QR Code.");
    }

    // Check if the staff has already eaten today
    const alreadyScanned = await this.repository.hasScannedToday(
      staff.id,
    );

    if (alreadyScanned) {
      throw new AppError(
        409,
        `${staff.firstName} ${staff.lastName} has already been served today.`,
      );
    }

    // Record today's attendance
    const attendance = await this.repository.createAttendance(
      staff.id,
    );

    // Socket.IO event will be emitted here later
    // app.io.emit("attendance:new", attendance);

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

  scannedAt: attendance.scannedAt,
});

return attendance;

    return attendance;
  }

  async getTodayAttendance() {
    return this.repository.findTodayAttendance();
  }

  async getAttendanceHistory() {
    return this.repository.findAttendanceHistory();
  }

  async getStaffAttendance(staffId: string) {
    const staff = await this.repository.findStaffAttendance(
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