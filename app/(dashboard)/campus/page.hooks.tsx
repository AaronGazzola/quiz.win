"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampuses, getCampusStats } from "./page.actions";
import { useEffect, useState } from "react";

export function useCampusManagement() {
  const [stats, setStats] = useState<Record<string, {
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    totalClassrooms: number;
    totalAssessments: number;
  }>>({});

  const {
    data: campusesData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["campuses"],
    queryFn: async () => {
      const response = await getCampuses();
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
  });

  useEffect(() => {
    if (campusesData && campusesData.length > 0) {
      Promise.all(
        campusesData.map(async (campus) => {
          const response = await getCampusStats(campus.id);
          if (response.data) {
            return { id: campus.id, stats: response.data };
          }
          return null;
        })
      ).then((results) => {
        const statsMap: Record<string, {
          totalStudents: number;
          totalTeachers: number;
          totalParents: number;
          totalClassrooms: number;
          totalAssessments: number;
        }> = {};
        results.forEach((result) => {
          if (result) {
            statsMap[result.id] = result.stats;
          }
        });
        setStats(statsMap);
      });
    }
  }, [campusesData]);

  return {
    campuses: campusesData || [],
    isLoading,
    refetch,
    stats,
  };
}
