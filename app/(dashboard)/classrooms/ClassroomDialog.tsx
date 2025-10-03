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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { createClassroom, updateClassroom } from "./page.actions";
import { getTeachers } from "../teachers/page.actions";
import type { ClassroomWithDetails } from "./page.actions";
import { toast } from "sonner";

interface ClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classroom?: ClassroomWithDetails;
  campusId: string;
}

const GRADE_OPTIONS = [
  "Pre-K",
  "Kindergarten",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const SUBJECT_OPTIONS = [
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

export function ClassroomDialog({
  open,
  onOpenChange,
  classroom,
  campusId,
}: ClassroomDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    grade: "",
    subject: "",
    teacherId: "",
    capacity: "",
    room: "",
  });

  const { data: teachersData } = useQuery({
    queryKey: ["teachers", campusId],
    queryFn: async () => {
      const response = await getTeachers(campusId);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!campusId && open,
  });

  const teachers = teachersData || [];

  useEffect(() => {
    if (classroom) {
      setFormData({
        name: classroom.name || "",
        grade: classroom.grade || "",
        subject: classroom.subject || "",
        teacherId: classroom.teacherId || "",
        capacity: classroom.capacity?.toString() || "",
        room: classroom.room || "",
      });
    } else {
      setFormData({
        name: "",
        grade: "",
        subject: "",
        teacherId: "",
        capacity: "",
        room: "",
      });
    }
  }, [classroom, open]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await createClassroom({
        name: data.name,
        grade: data.grade,
        subject: data.subject,
        campusId,
        teacherId: data.teacherId,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        room: data.room || undefined,
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", campusId] });
      toast.success("Classroom created successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create classroom");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!classroom) throw new Error("No classroom to update");
      const response = await updateClassroom(classroom.id, {
        name: data.name,
        grade: data.grade,
        subject: data.subject,
        teacherId: data.teacherId,
        capacity: data.capacity ? parseInt(data.capacity) : undefined,
        room: data.room || undefined,
      });
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classrooms", campusId] });
      toast.success("Classroom updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update classroom");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (classroom) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {classroom ? "Edit Classroom" : "Create Classroom"}
          </DialogTitle>
          <DialogDescription>
            {classroom
              ? `Update classroom details for ${classroom.name}`
              : "Create a new classroom"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Classroom Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grade 3A Math"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <select
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select grade...</option>
                {GRADE_OPTIONS.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select subject...</option>
                {SUBJECT_OPTIONS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId">Teacher</Label>
            <select
              id="teacherId"
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select teacher...</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., Room 101"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g., 30"
                min="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? classroom
                  ? "Updating..."
                  : "Creating..."
                : classroom
                  ? "Update Classroom"
                  : "Create Classroom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
