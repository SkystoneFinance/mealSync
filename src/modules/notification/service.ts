import { getSocket } from "../../services/socket";
import type { NotificationPayload } from "./types";

export class NotificationService {
  notify(payload: NotificationPayload) {
    const io = getSocket();

    io.emit("notification:new", payload);
  }

  success(title: string, message: string) {
    this.notify({
      title,
      message,
      type: "success",
      timestamp: new Date(),
    });
  }

  warning(title: string, message: string) {
    this.notify({
      title,
      message,
      type: "warning",
      timestamp: new Date(),
    });
  }

  error(title: string, message: string) {
    this.notify({
      title,
      message,
      type: "error",
      timestamp: new Date(),
    });
  }

  info(title: string, message: string) {
    this.notify({
      title,
      message,
      type: "info",
      timestamp: new Date(),
    });
  }
}