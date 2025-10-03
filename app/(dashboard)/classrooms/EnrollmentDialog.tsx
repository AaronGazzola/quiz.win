"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollStudentInClassroom, removeStudentFromClassroom } from "./page.actions";
import { getStudents } from "../students/page.actions";
import type { ClassroomWithDetails } from "./page.actions";
import { toast } from "sonner";
import { X } from "lucide-react";

interface EnrollmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: ClassroomWithDetails;
  campusId: string;
}

export function EnrollmentDialog({
  open,
  onOpenChange,
  classroom,
  campusId,
}: EnrollmentDialogProps) {
  const queryClient = useQueryClient();

  const { data: studentsData } = useQuery({
    queryKey: ["students", campusId],
    queryFn: async () => {
      const response = await getStudents(campusId);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!campusId && open,
  });

  const students = studentsData || [];
  const enrolledStudentIds = classroom?.students.map((s) => s.student.id) || [];

  const enrollMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!classroom) throw new Error("No classroom selected");
      const response = await enrollStudentInClassroom(studentId, classroom.id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", campusId] });
      toast.success("Student enrolled successfully");
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to enroll student");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!classroom) throw new Error("No classroom selected");
      const response = await removeStudentFromClassroom(studentId, classroom.id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", campusId] });
      toast.success("Student removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove student");
    },
  });

  const handleEnroll = (studentId: string) => {
    enrollMutation.mutate(studentId);
  };

  const handleRemove = (studentId: string) => {
    removeMutation.mutate(studentId);
  };

  const isPending = enrollMutation.isPending || removeMutation.isPending;

  if (!classroom) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Student Enrollment</DialogTitle>
          <DialogDescription>
            Enroll or remove students from {classroom.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Enrolled Students</h3>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border rounded-md">
              {classroom.students.length > 0 ? (
                classroom.students.map((enrollment) => (
                  <Badge
                    key={enrollment.student.id}
                    variant="secondary"
                    className="gap-1"
                  >
                    {enrollment.student.user.name}
                    <button
                      type="button"
                      onClick={() => handleRemove(enrollment.student.id)}
                      className="ml-1 hover:text-destructive"
                      disabled={isPending}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">
                  No students enrolled
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Add Students</h3>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleEnroll(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
              disabled={isPending}
            >
              <option value="">Select a student to enroll...</option>
              {students
                .filter((s) => !enrolledStudentIds.includes(s.id))
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.name} ({student.grade})
                  </option>
                ))}
            </select>
          </div>

          {classroom.capacity && (
            <div className="text-sm text-muted-foreground">
              Enrollment: {classroom.students.length} / {classroom.capacity}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
