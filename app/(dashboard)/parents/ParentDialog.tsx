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
import { updateParent, updateParentContact } from "./page.actions";
import { getStudents } from "../students/page.actions";
import { assignParentToStudent, removeParentFromStudent } from "../students/page.actions";
import type { ParentWithUser } from "./page.actions";
import { toast } from "sonner";
import { X } from "lucide-react";

interface ParentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parent?: ParentWithUser;
  campusId: string;
}

const RELATIONSHIP_OPTIONS = [
  "Mother",
  "Father",
  "Guardian",
  "Grandmother",
  "Grandfather",
  "Aunt",
  "Uncle",
  "Foster Parent",
  "Other",
];

export function ParentDialog({
  open,
  onOpenChange,
  parent,
  campusId,
}: ParentDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    relationship: "",
    occupation: "",
    primaryContact: false,
    phone: "",
    email: "",
  });

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
  const assignedStudentIds = parent?.students.map((sp) => sp.student.id) || [];

  useEffect(() => {
    if (parent) {
      setFormData({
        relationship: parent.relationship || "",
        occupation: parent.occupation || "",
        primaryContact: parent.primaryContact || false,
        phone: parent.user.phone || "",
        email: parent.user.email || "",
      });
    } else {
      setFormData({
        relationship: "",
        occupation: "",
        primaryContact: false,
        phone: "",
        email: "",
      });
    }
  }, [parent, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!parent) throw new Error("No parent to update");
      const parentResponse = await updateParent(parent.id, {
        relationship: data.relationship,
        occupation: data.occupation,
        primaryContact: data.primaryContact,
      });
      if (parentResponse.error) throw new Error(parentResponse.error);

      const contactResponse = await updateParentContact(parent.id, {
        phone: data.phone,
        email: data.email,
      });
      if (contactResponse.error) throw new Error(contactResponse.error);

      return { parent: parentResponse.data, user: contactResponse.data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents", campusId] });
      toast.success("Parent updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update parent");
    },
  });

  const assignStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!parent) throw new Error("No parent to update");
      const response = await assignParentToStudent(studentId, parent.id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents", campusId] });
      queryClient.invalidateQueries({ queryKey: ["students", campusId] });
      toast.success("Student assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to assign student");
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      if (!parent) throw new Error("No parent to update");
      const response = await removeParentFromStudent(studentId, parent.id);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parents", campusId] });
      queryClient.invalidateQueries({ queryKey: ["students", campusId] });
      toast.success("Student removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to remove student");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleAssignStudent = (studentId: string) => {
    assignStudentMutation.mutate(studentId);
  };

  const handleRemoveStudent = (studentId: string) => {
    removeStudentMutation.mutate(studentId);
  };

  const isPending = updateMutation.isPending || assignStudentMutation.isPending || removeStudentMutation.isPending;

  if (!parent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Parent</DialogTitle>
            <DialogDescription>
              Please create a user account first, then assign them a parent profile.
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Parent Profile</DialogTitle>
          <DialogDescription>
            Update parent information for {parent.user.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <select
              id="relationship"
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select relationship...</option>
              {RELATIONSHIP_OPTIONS.map((rel) => (
                <option key={rel} value={rel}>
                  {rel}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              value={formData.occupation}
              onChange={(e) =>
                setFormData({ ...formData, occupation: e.target.value })
              }
              placeholder="Engineer, Teacher, etc."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="primaryContact"
              checked={formData.primaryContact}
              onChange={(e) =>
                setFormData({ ...formData, primaryContact: e.target.checked })
              }
              className="h-4 w-4"
            />
            <Label htmlFor="primaryContact">Primary Contact</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+1234567890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="parent@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Assigned Students</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {parent.students.map((sp) => (
                <Badge key={sp.student.id} variant="outline" className="gap-1">
                  {sp.student.user.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveStudent(sp.student.id)}
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
                  handleAssignStudent(e.target.value);
                  e.target.value = "";
                }
              }}
              className="w-full px-3 py-2 border rounded-md"
              disabled={isPending}
            >
              <option value="">Assign a student...</option>
              {students
                .filter((s) => !assignedStudentIds.includes(s.id))
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user.name}
                  </option>
                ))}
            </select>
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
              {isPending ? "Saving..." : "Update Parent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
