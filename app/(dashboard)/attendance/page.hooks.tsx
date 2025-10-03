"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { getAttendanceByClassroomAction } from "./page.actions";
import { getClassrooms } from "../classrooms/page.actions";
import { useState } from "react";

export function useAttendanceManagement() {
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  const currentCampusId = session?.session?.activeOrganizationId;
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getClassrooms(currentCampusId);
      return result.data || [];
    },
    enabled: !!currentCampusId,
  });

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: [
      "attendance",
      currentCampusId,
      selectedClassroom,
      selectedDate,
    ],
    queryFn: async () => {
      if (!currentCampusId || !selectedClassroom) return [];
      const startDate = selectedDate ? new Date(selectedDate) : undefined;
      const endDate = selectedDate
        ? new Date(new Date(selectedDate).setHours(23, 59, 59))
        : undefined;
      const result = await getAttendanceByClassroomAction(
        selectedClassroom,
        startDate,
        endDate
      );
      return result.data || [];
    },
    enabled: !!currentCampusId && !!selectedClassroom,
  });

  return {
    sessions,
    isLoading,
    currentCampusId,
    selectedClassroom,
    setSelectedClassroom,
    classrooms,
    selectedDate,
    setSelectedDate,
  };
}
