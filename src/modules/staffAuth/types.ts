export interface ActivateStaffDto {
  staffNumber: string;
  phoneNumber: string;
}

export interface VerifyStaffOtpDto {
  staffNumber: string;
  phoneNumber: string;
  code: string;
}
