import NotificationContext from "@/app/context/NotificationContext";
import { useContext } from "react";

export default function useNotification() {
  return useContext(NotificationContext);
}
