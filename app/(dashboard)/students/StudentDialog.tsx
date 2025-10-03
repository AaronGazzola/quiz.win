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
import { Badge } from "@/components/ui/badge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { updateStudent, assignParentToStudent, removeParentFromStudent } from "./page.actions";
import { getParents } from "../parents/page.actions";
import type { StudentWithUser } from "./page.actions";
import { toast } from "sonner";
import { X } from "lucide-react";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: StudentWithUser;
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

export function StudentDialog({
  open,
  onOpenChange,
  student,
  campusId,
}: StudentDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    grade: "",
    photoUrl: "",
    medicalInfo: {} as Record<string, string>,
    authorizedPickups: [] as Record<string, string>[],
  });

  const { data: parentsData } = useQuery({
    queryKey: ["parents", campusId],
    queryFn: async () => {
      const response = await getParents(campusId);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!campusId && open,
  });

  const parents = parentsData || [];
  const assignedParentIds = student?.parents.map((sp) => sp.parent.id) || [];

  useEffect(() => {
    if (student) {
      setFormData({
        grade: student.grade || "",
        photoUrl: student.photoUrl || "",
        medicalInfo: (student.medicalInfo as Record<string, string>) || {},
        authorizedPickups: (student.authorizedPickups as Record<string, string>[]) || [],
      });
    } else {
      setFormData({
        grade: "",
        photoUrl: "",
        medicalInfo: {},
        authorizedPickups: [],
      });
    }
  }, [student, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!student) throw new Error("No student to update");
      const response = await updateStudent(student.id, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", campusId] });
      toast.success("Student updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update student");
    },
  });

  const assignParentMutation = useMutation({
    mutationFn: async (parentId: string) => {
      if (!student) throw new Error("No student to update");
      const response = await assignParentToStudent(student.id, parentId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", campusId] });
      toast.success("Parent assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to assign parent");
    },
  });

  const removeParentMutation = useMutation({
    mutationFn: async (parentId: string) => {
      if (!student) throw new Error("No student to update");
      const response = await removeParentFromStudent(student.id, parentId);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students", campusId] });
      toast.success("Parent removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove parent");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleAssignParent = (parentId: string) => {
    assignParentMutation.mutate(parentId);
  };

  const handleRemoveParent = (parentId: string) => {
    removeParentMutation.mutate(parentId);
  };

  const isPending = updateMutation.isPending || assignParentMutation.isPending || removeParentMutation.isPending;

  if (!student) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
            <DialogDescription>
              Please create a user account first, then assign them a student profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Profile</DialogTitle>
          <DialogDescription>
            Update student information for {student.user.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              id="photoUrl"
              value={formData.photoUrl}
              onChange={(e) =>
                setFormData({ ...formData, photoUrl: e.target.value })
              }
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label>Assigned Parents</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {student.parents.map((sp) => (
                <Badge key={sp.parent.id} variant="outline" className="gap-1">
                  {sp.parent.user.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveParent(sp.parent.id)}
                    className="ml-1 hover:text-destructive"
                    disabled={isPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAssignParent(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
              disabled={isPending}
            >
              <option value="">Assign a parent...</option>
              {parents
                .filter((p) => !assignedParentIds.includes(p.id))
                .map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.user.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalAllergies">Medical Info - Allergies</Label>
            <Input
              id="medicalAllergies"
              value={formData.medicalInfo.allergies || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicalInfo: { ...formData.medicalInfo, allergies: e.target.value },
                })
              }
              placeholder="Peanuts, dairy, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalConditions">Medical Info - Conditions</Label>
            <Input
              id="medicalConditions"
              value={formData.medicalInfo.conditions || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicalInfo: { ...formData.medicalInfo, conditions: e.target.value },
                })
              }
              placeholder="Asthma, diabetes, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalMedications">Medical Info - Medications</Label>
            <Input
              id="medicalMedications"
              value={formData.medicalInfo.medications || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  medicalInfo: { ...formData.medicalInfo, medications: e.target.value },
                })
              }
              placeholder="Inhaler, insulin, etc."
            />
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
              {isPending ? "Saving..." : "Update Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
