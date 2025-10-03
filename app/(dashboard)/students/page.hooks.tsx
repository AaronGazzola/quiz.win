"use client";

import { useQuery } from "@tanstack/react-query";
import { getStudents } from "./page.actions";
import { useAppStore } from "@/app/layout.stores";
import { useState } from "react";

export function useStudentManagement() {
  const { selectedOrganizationIds } = useAppStore();
  const currentCampusId = selectedOrganizationIds[0];
  const [gradeFilter, setGradeFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");

  const {
    data: studentsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["students", currentCampusId, gradeFilter, searchFilter],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const response = await getStudents(currentCampusId, {
        grade: gradeFilter || undefined,
        search: searchFilter || undefined,
      });
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!currentCampusId,
  });

  return {
    students: studentsData || [],
    isLoading,
    refetch,
    currentCampusId,
    gradeFilter,
    setGradeFilter,
    searchFilter,
    setSearchFilter,
  };
}
