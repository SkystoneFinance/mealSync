export type DashboardStats = {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  mealsServedToday: number;
  remainingStaff: number;
};

export type RecentAttendance = {
  id: string;
  scannedAt: Date;
  staff: {
    id: string;
    staffNumber: string;
    firstName: string;
    lastName: string;
    department: string;
  };
};