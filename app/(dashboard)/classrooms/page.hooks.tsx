"use client";

import { useQuery } from "@tanstack/react-query";
import { getClassrooms } from "./page.actions";
import { useAppStore } from "@/app/layout.stores";
import { useState } from "react";

export function useClassroomManagement() {
  const { selectedOrganizationIds } = useAppStore();
  const currentCampusId = selectedOrganizationIds[0];
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");

  const {
    data: classroomsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["classrooms", currentCampusId, gradeFilter, subjectFilter],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const response = await getClassrooms(currentCampusId, {
        grade: gradeFilter || undefined,
        subject: subjectFilter || undefined,
      });
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!currentCampusId,
  });

  return {
    classrooms: classroomsData || [],
    isLoading,
    refetch,
    currentCampusId,
    gradeFilter,
    setGradeFilter,
    subjectFilter,
    setSubjectFilter,
  };
}
