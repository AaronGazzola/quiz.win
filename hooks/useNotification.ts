import NotificationContext from "@/context/NotificationContext";
import { useContext } from "react";

export default function useNotification() {
  return useContext(NotificationContext);
}
