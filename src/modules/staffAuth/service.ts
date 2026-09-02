import crypto from "crypto";
import bcrypt from "bcrypt";

import {
  AppError,
} from "../../utils/error";

import {
  StaffAuthRepository,
} from "./repository";


export class StaffAuthService {

  private readonly repo =
    new StaffAuthRepository();


  // ===============================
  // GENERATE SECURE OTP
  // ===============================

  private generateOtp() {

    return crypto
      .randomInt(
        100000,
        1000000,
      )
      .toString();

  }


  // ===============================
  // ACTIVATE STAFF / SEND OTP
  // ===============================

  async activate(
    staffNumber: string,
    phoneNumber: string,
  ) {

    const staff =
      await this.repo.findStaffByNumber(
        staffNumber,
      );


    // -------------------------------
    // STAFF EXISTS?
    // -------------------------------

    if (!staff) {

      throw new AppError(
        404,
        "Staff number not found",
      );

    }


    // -------------------------------
    // STAFF ACTIVE?
    // -------------------------------

    if (!staff.isActive) {

      throw new AppError(
        403,
        "Staff account is inactive",
      );

    }


    // -------------------------------
    // PHONE ALREADY BELONGS TO STAFF?
    // -------------------------------

    if (
      staff.phoneNumber &&
      staff.phoneNumber !== phoneNumber
    ) {

      throw new AppError(
        409,
        "This staff account is already linked to another phone number",
      );

    }


    // -------------------------------
    // PHONE BELONGS TO ANOTHER STAFF?
    // -------------------------------

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


    // -------------------------------
    // FIRST-TIME ACTIVATION
    // -------------------------------

    if (!staff.phoneNumber) {

      await this.repo.updatePhoneNumber(
        staff.id,
        phoneNumber,
      );

    }


    // -------------------------------
    // INVALIDATE OLD OTPs
    // -------------------------------

    await this.repo.invalidatePreviousOtps(
      staff.id,
    );


    // -------------------------------
    // GENERATE SECURE OTP
    // -------------------------------

    const code =
      this.generateOtp();


    // -------------------------------
    // HASH OTP
    // -------------------------------

    const hashedCode =
      await bcrypt.hash(
        code,
        10,
      );


    // -------------------------------
    // EXPIRE IN 5 MINUTES
    // -------------------------------

    const expiresAt =
      new Date(
        Date.now() + 5 * 60 * 1000,
      );


    // -------------------------------
    // SAVE HASHED OTP
    // -------------------------------

    await this.repo.createOtp({

      staffId: staff.id,

      code: hashedCode,

      expiresAt,

    });


    // ===============================
    // DEVELOPMENT ONLY
    // ===============================

    console.log(
      `\n🔐 Staff OTP`,
    );

    console.log(
      `Staff: ${staff.staffNumber}`,
    );

    console.log(
      `Phone: ${phoneNumber}`,
    );

    console.log(
      `OTP: ${code}`,
    );

    console.log(
      `Expires: ${expiresAt.toLocaleString()}\n`,
    );


    return {

      message:
        "OTP generated successfully.",

    };

  }


  // ===============================
  // VERIFY OTP
  // ===============================

  async verifyOtp(
    staffNumber: string,
    phoneNumber: string,
    code: string,
  ) {

    const staff =
      await this.repo.findStaffByNumber(
        staffNumber,
      );


    // -------------------------------
    // STAFF EXISTS?
    // -------------------------------

    if (!staff) {

      throw new AppError(
        404,
        "Staff number not found",
      );

    }


    // -------------------------------
    // STAFF ACTIVE?
    // -------------------------------

    if (!staff.isActive) {

      throw new AppError(
        403,
        "Staff account is inactive",
      );

    }


    // -------------------------------
    // PHONE MATCH?
    // -------------------------------

    if (
      staff.phoneNumber !== phoneNumber
    ) {

      throw new AppError(
        401,
        "Phone number does not match this staff account",
      );

    }


    // -------------------------------
    // GET LATEST VALID OTP
    // -------------------------------

    const otp =
      await this.repo.findLatestValidOtp(
        staff.id,
      );


    if (!otp) {

      throw new AppError(
        401,
        "Invalid or expired OTP",
      );

    }


    // -------------------------------
    // COMPARE HASHED OTP
    // -------------------------------

    const isValid =
      await bcrypt.compare(
        code,
        otp.code,
      );


    if (!isValid) {

      throw new AppError(
        401,
        "Invalid OTP",
      );

    }


    // -------------------------------
    // MARK OTP AS USED
    // -------------------------------

    await this.repo.markOtpVerified(
      otp.id,
    );


    return staff;

  }

}