"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assignGradeAction, updateGradeAction } from "./page.actions";
import { getClassrooms } from "../classrooms/page.actions";
import { getStudents } from "../students/page.actions";
import { authClient } from "@/lib/auth-client";

interface GradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  grade?: {
    id: string;
    studentId: string;
    classroomId: string;
    subject: string;
    grade: string;
    gradingPeriod: string;
    comments?: string;
  };
}

const GRADING_PERIODS = [
  "Quarter 1",
  "Quarter 2",
  "Quarter 3",
  "Quarter 4",
  "Semester 1",
  "Semester 2",
  "Final",
];

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Geography",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Art",
  "Music",
  "Physical Education",
];

export function GradeDialog({
  open,
  onOpenChange,
  onClose,
  grade,
}: GradeDialogProps) {
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data } = await authClient.getSession();
      return data;
    },
  });

  const currentCampusId = session?.session?.activeOrganizationId;
  const [formData, setFormData] = useState({
    studentId: "",
    classroomId: "",
    subject: "",
    grade: "",
    gradingPeriod: "",
    comments: "",
  });

  const { data: classrooms = [] } = useQuery({
    queryKey: ["classrooms", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getClassrooms(currentCampusId);
      return result.data || [];
    },
    enabled: !!currentCampusId && open,
  });

  const { data: students = [] } = useQuery({
    queryKey: ["students", currentCampusId],
    queryFn: async () => {
      if (!currentCampusId) return [];
      const result = await getStudents(currentCampusId);
      return result.data || [];
    },
    enabled: !!currentCampusId && open,
  });

  useEffect(() => {
    if (grade) {
      setFormData({
        studentId: grade.studentId || "",
        classroomId: grade.classroomId || "",
        subject: grade.subject || "",
        grade: grade.grade || "",
        gradingPeriod: grade.gradingPeriod || "",
        comments: grade.comments || "",
      });
    } else {
      setFormData({
        studentId: "",
        classroomId: "",
        subject: "",
        grade: "",
        gradingPeriod: "",
        comments: "",
      });
    }
  }, [grade, open]);

  const assignMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return assignGradeAction(
        data.studentId,
        data.classroomId,
        data.subject,
        data.grade,
        data.gradingPeriod,
        data.comments
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades-classroom"] });
      queryClient.invalidateQueries({ queryKey: ["grades-student"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!grade?.id) throw new Error("Grade ID required");
      return updateGradeAction(grade.id, {
        grade: data.grade,
        gradingPeriod: data.gradingPeriod,
        comments: data.comments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades-classroom"] });
      queryClient.invalidateQueries({ queryKey: ["grades-student"] });
      onClose();
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grade) {
      await updateMutation.mutateAsync(formData);
    } else {
      await assignMutation.mutateAsync(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{grade ? "Edit Grade" : "Add Grade"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="studentId">Student</Label>
            <select
              id="studentId"
              className="w-full mt-1 p-2 border rounded"
              value={formData.studentId}
              onChange={(e) =>
                setFormData({ ...formData, studentId: e.target.value })
              }
              required
              disabled={!!grade}
            >
              <option value="">Select Student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.user?.name} - Grade {student.grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="classroomId">Classroom</Label>
            <select
              id="classroomId"
              className="w-full mt-1 p-2 border rounded"
              value={formData.classroomId}
              onChange={(e) =>
                setFormData({ ...formData, classroomId: e.target.value })
              }
              required
              disabled={!!grade}
            >
              <option value="">Select Classroom</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <select
              id="subject"
              className="w-full mt-1 p-2 border rounded"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              required
              disabled={!!grade}
            >
              <option value="">Select Subject</option>
              {SUBJECTS.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="grade">Grade</Label>
            <Input
              id="grade"
              value={formData.grade}
              onChange={(e) =>
                setFormData({ ...formData, grade: e.target.value })
              }
              placeholder="A, B+, 95, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="gradingPeriod">Grading Period</Label>
            <select
              id="gradingPeriod"
              className="w-full mt-1 p-2 border rounded"
              value={formData.gradingPeriod}
              onChange={(e) =>
                setFormData({ ...formData, gradingPeriod: e.target.value })
              }
              required
            >
              <option value="">Select Period</option>
              {GRADING_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {period}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="comments">Comments (Optional)</Label>
            <textarea
              id="comments"
              className="w-full mt-1 p-2 border rounded"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={3}
              placeholder="Teacher comments..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignMutation.isPending || updateMutation.isPending}
            >
              {grade ? "Update" : "Add"} Grade
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
