export interface ActivateStaffDto {
  staffNumber: string;
  pin: string;
  confirmPin: string;
}


export interface StaffLoginDto {
  staffNumber: string;
  pin: string;
}