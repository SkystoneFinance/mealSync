export interface CreateStaffDto {
  fullName: string;
  staffId: string;
  department: string;
}

export interface UpdateStaffDto {
  fullName?: string;
  department?: string;
}