import { AppError } from "../../utils/error";

import {
  StaffAuthRepository,
} from "./repository";

export class StaffAuthService {

  private readonly repo =
    new StaffAuthRepository();


  async activate(
    staffNumber: string,
    phoneNumber: string,
  ) {

    const staff =
      await this.repo.findStaffByNumber(
        staffNumber,
      );

    if (!staff) {
      throw new AppError(
        404,
        "Staff number not found",
      );
    }

    if (!staff.isActive) {
      throw new AppError(
        403,
        "Staff account is inactive",
      );
    }


    // Already linked to another number
    if (
      staff.phoneNumber &&
      staff.phoneNumber !== phoneNumber
    ) {
      throw new AppError(
        409,
        "This staff account is already linked to another phone number",
      );
    }


    // Make sure phone isn't already
    // attached to another staff
    const existingStaff =
      await this.repo.findStaffByPhone(
        phoneNumber,
      );

    if (
      existingStaff &&
      existingStaff.id !== staff.id
    ) {
      throw new AppError(
        409,
        "This phone number is already linked to another staff account",
      );
    }


    // First-time activation
    if (!staff.phoneNumber) {

      await this.repo.updatePhoneNumber(
        staff.id,
        phoneNumber,
      );

    }


    // Generate 6-digit OTP
    const code =
      Math.floor(
        100000 +
        Math.random() * 900000,
      ).toString();


    // OTP expires in 5 minutes
    const expiresAt =
      new Date(
        Date.now() + 5 * 60 * 1000,
      );


    await this.repo.createOtp({

      staffId: staff.id,

      code,

      expiresAt,

    });


    // DEVELOPMENT ONLY
    console.log(
      `Staff OTP for ${staff.staffNumber}: ${code}`,
    );


    return {
      message:
        "OTP generated successfully.",
    };
  }


  async verifyOtp(
    staffNumber: string,
    phoneNumber: string,
    code: string,
  ) {

    const staff =
      await this.repo.findStaffByNumber(
        staffNumber,
      );


    if (!staff) {
      throw new AppError(
        404,
        "Staff number not found",
      );
    }


    if (!staff.isActive) {
      throw new AppError(
        403,
        "Staff account is inactive",
      );
    }


    if (staff.phoneNumber !== phoneNumber) {
      throw new AppError(
        401,
        "Phone number does not match this staff account",
      );
    }


    const otp =
      await this.repo.findValidOtp(
        staff.id,
        code,
      );


    if (!otp) {
      throw new AppError(
        401,
        "Invalid or expired OTP",
      );
    }


    await this.repo.markOtpVerified(
      otp.id,
    );


    return staff;
  }
}
