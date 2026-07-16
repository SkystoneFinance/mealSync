export interface CreateStaffDto {
  staffNumber: string;
  firstName: string;
  lastName: string;
  department: string;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  department?: string;
  isActive?: boolean;
}