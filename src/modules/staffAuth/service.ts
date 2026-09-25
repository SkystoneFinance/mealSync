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


  // ==========================================
  // FIRST-TIME STAFF ACTIVATION
  // ==========================================

  async activate(
    staffNumber: string,
    pin: string,
  ) {

    // ----------------------------------------
    // FIND STAFF
    // ----------------------------------------

    const staff =
      await this.repo.findStaffByNumber(
        staffNumber,
      );


    if (!staff) {
      throw new AppError(
        404,
        "Staff number not found.",
      );
    }


    // ----------------------------------------
    // CHECK STAFF STATUS
    // ----------------------------------------

    if (!staff.isActive) {
      throw new AppError(
        403,
        "Staff account is inactive.",
      );
    }


    // ----------------------------------------
    // CHECK USER ACCOUNT
    // ----------------------------------------

    const user =
      staff.user;


    // ----------------------------------------
    // USER DOES NOT EXIST
    // ----------------------------------------

    if (!user) {

      const hashedPin =
        await bcrypt.hash(
          pin,
          10,
        );


      await this.repo.createUserForStaff(
        staff.id,
        hashedPin,
      );


      return {
        message:
          "Staff account activated successfully.",
      };
    }


    // ----------------------------------------
    // ACCOUNT ALREADY ACTIVATED
    // ----------------------------------------

    if (user.password) {

      throw new AppError(
        409,
        "Staff account has already been activated. Please login.",
      );
    }


    // ----------------------------------------
    // HASH PIN
    // ----------------------------------------

    const hashedPin =
      await bcrypt.hash(
        pin,
        10,
      );


    // ----------------------------------------
    // SAVE PIN
    // ----------------------------------------

    await this.repo.updateUserPassword(
      user.id,
      hashedPin,
    );


    return {
      message:
        "Staff account activated successfully.",
    };
  }


  // ==========================================
  // STAFF LOGIN
  // ==========================================

  async login(
    staffNumber: string,
    pin: string,
  ) {

    // ----------------------------------------
    // FIND STAFF
    // ----------------------------------------

    const staff =
      await this.repo.findStaffByNumber(
        staffNumber,
      );


    if (!staff) {
      throw new AppError(
        404,
        "Staff number not found.",
      );
    }


    // ----------------------------------------
    // CHECK STAFF STATUS
    // ----------------------------------------

    if (!staff.isActive) {
      throw new AppError(
        403,
        "Staff account is inactive.",
      );
    }


    // ----------------------------------------
    // CHECK USER
    // ----------------------------------------

    const user =
      staff.user;


    if (!user) {

      throw new AppError(
        401,
        "Staff account has not been activated yet.",
      );
    }


    // ----------------------------------------
    // CHECK USER STATUS
    // ----------------------------------------

    if (!user.isActive) {

      throw new AppError(
        403,
        "Staff account is inactive.",
      );
    }


    // ----------------------------------------
    // CHECK PASSWORD/PIN
    // ----------------------------------------

    if (!user.password) {

      throw new AppError(
        401,
        "Staff account has not been activated yet.",
      );
    }


    // ----------------------------------------
    // VERIFY PIN
    // ----------------------------------------

    const isValid =
      await bcrypt.compare(
        pin,
        user.password,
      );


    if (!isValid) {

      throw new AppError(
        401,
        "Invalid staff number or PIN.",
      );
    }


    // ----------------------------------------
    // SUCCESS
    // ----------------------------------------

    return staff;
  }


  // ==========================================
  // GET STAFF PROFILE
  // ==========================================

  async getProfile(
    staffId: string,
  ) {

    const staff =
      await this.repo.findStaffById(
        staffId,
      );


    if (!staff) {

      throw new AppError(
        404,
        "Staff profile not found.",
      );
    }


    return {

      id: staff.id,

      staffNumber:
        staff.staffNumber,

      firstName:
        staff.firstName,

      lastName:
        staff.lastName,

      department:
        staff.department,

      phoneNumber:
        staff.phoneNumber,

      qrImage:
        staff.qrImage,

      isActive:
        staff.isActive,

    };
  }
}