"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppStore } from "@/app/layout.stores";
import {
  getGradesByClassroomAction,
  getGradesByStudentAction,
} from "./page.actions";
import { getClassrooms } from "../classrooms/page.actions";
import { getStudents } from "../students/page.actions";
import { useState } from "react";

export function useGradesManagement() {
  const currentCampusId = useAppStore((state) => state.currentCampusId);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    null
  );
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getClassrooms(currentCampusId);
      return result.data || [];
    },
    enabled: !!currentCampusId,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getStudents(currentCampusId);
      return result.data || [];
    },
    enabled: !!currentCampusId,
  });

  const { data: gradesByClassroom = [], isLoading: isLoadingClassroom } =
    useQuery({
      queryKey: ["grades-classroom", selectedClassroom, selectedPeriod],
      queryFn: async () => {
        if (!selectedClassroom) return [];
        const result = await getGradesByClassroomAction(
          selectedClassroom,
          selectedPeriod || undefined
        );
        return result.data || [];
      },
      enabled: !!selectedClassroom,
    });

  const { data: gradesByStudent = [], isLoading: isLoadingStudent } = useQuery(
    {
      queryKey: ["grades-student", selectedStudent, selectedPeriod],
      queryFn: async () => {
        if (!selectedStudent) return [];
        const result = await getGradesByStudentAction(
          selectedStudent,
          selectedPeriod || undefined
        );
        return result.data || [];
      },
      enabled: !!selectedStudent,
    }
  );

  const grades = selectedStudent
    ? gradesByStudent
    : selectedClassroom
      ? gradesByClassroom
      : [];
  const isLoading = isLoadingClassroom || isLoadingStudent;

  return {
    grades,
    isLoading,
    currentCampusId,
    selectedClassroom,
    setSelectedClassroom,
    selectedStudent,
    setSelectedStudent,
    selectedPeriod,
    setSelectedPeriod,
    classrooms,
    students,
  };
}
