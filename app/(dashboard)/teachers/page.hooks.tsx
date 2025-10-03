"use client";

import { useQuery } from "@tanstack/react-query";
import { getTeachers } from "./page.actions";
import { useAppStore } from "@/app/layout.stores";

export function useTeacherManagement() {
  const { selectedOrganizationIds } = useAppStore();
  const currentCampusId = selectedOrganizationIds[0];

  const {
    data: teachersData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["teachers", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const response = await getTeachers(currentCampusId);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!currentCampusId,
  });

  return {
    teachers: teachersData || [],
    isLoading,
    refetch,
    currentCampusId,
  };
}
