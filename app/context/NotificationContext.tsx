import { Notification } from "@/app/types/notification.types";
import { createContext } from "react";

interface NotificationContext {
  showNotification: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContext>({
  showNotification: () => {},
});

export default NotificationContext;
