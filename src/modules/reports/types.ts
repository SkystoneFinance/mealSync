export type ReportPeriod =
  | "today"
  | "weekly"
  | "monthly";


export type ExportPeriod =
  | "today"
  | "current-week"
  | "previous-week"
  | "current-month"
  | "previous-month";

export interface ReportQuery {
  from?: string;
  to?: string;
}

export interface DepartmentReport {
  department: string;
  totalStaff: number;
  served: number;
  remaining: number;
}

export interface SummaryReport {
  totalStaff: number;
  served: number;
  remaining: number;
  attendanceRate: number;
}

