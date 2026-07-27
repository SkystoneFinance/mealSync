export type NotificationType =
  | "success"
  | "warning"
  | "error"
  | "info";

export interface NotificationPayload {
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}