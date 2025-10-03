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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { updateTeacher } from "./page.actions";
import type { TeacherWithUser } from "./page.actions";
import { toast } from "sonner";
import { X } from "lucide-react";

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: TeacherWithUser;
  campusId: string;
}

const COMMON_SUBJECTS = [
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

const COMMON_CERTIFICATIONS = [
  "B.Ed",
  "M.Ed",
  "PGCE",
  "Teaching License",
  "Subject Specialist",
  "ESL Certified",
];

export function TeacherDialog({
  open,
  onOpenChange,
  teacher,
  campusId,
}: TeacherDialogProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    employeeId: "",
    subjects: [] as string[],
    certifications: [] as string[],
    cvUrl: "",
  });

  const [newSubject, setNewSubject] = useState("");
  const [newCertification, setNewCertification] = useState("");

  useEffect(() => {
    if (teacher) {
      setFormData({
        employeeId: teacher.employeeId || "",
        subjects: teacher.subjects || [],
        certifications: teacher.certifications || [],
        cvUrl: teacher.cvUrl || "",
      });
    } else {
      setFormData({
        employeeId: "",
        subjects: [],
        certifications: [],
        cvUrl: "",
      });
    }
    setNewSubject("");
    setNewCertification("");
  }, [teacher, open]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!teacher) throw new Error("No teacher to update");
      const response = await updateTeacher(teacher.id, data);
      if (response.error) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers", campusId] });
      toast.success("Teacher updated successfully");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update teacher");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const addSubject = (subject: string) => {
    if (subject && !formData.subjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject],
      });
    }
  };

  const removeSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((s) => s !== subject),
    });
  };

  const addCertification = (cert: string) => {
    if (cert && !formData.certifications.includes(cert)) {
      setFormData({
        ...formData,
        certifications: [...formData.certifications, cert],
      });
    }
  };

  const removeCertification = (cert: string) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((c) => c !== cert),
    });
  };

  const isPending = updateMutation.isPending;

  if (!teacher) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Teacher</DialogTitle>
            <DialogDescription>
              Please create a user account first, then assign them a teacher profile.
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
          <DialogTitle>Edit Teacher Profile</DialogTitle>
          <DialogDescription>
            Update teacher information for {teacher.user.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              value={formData.employeeId}
              onChange={(e) =>
                setFormData({ ...formData, employeeId: e.target.value })
              }
              placeholder="EMP-001"
            />
          </div>

          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="gap-1">
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeSubject(subject)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newSubject}
                onChange={(e) => {
                  if (e.target.value) {
                    addSubject(e.target.value);
                    setNewSubject("");
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-md"
              >
                <option value="">Select a subject...</option>
                {COMMON_SUBJECTS.filter(
                  (s) => !formData.subjects.includes(s)
                ).map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Or type custom subject..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSubject(newSubject);
                    setNewSubject("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addSubject(newSubject);
                  setNewSubject("");
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Certifications</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.certifications.map((cert) => (
                <Badge key={cert} variant="outline" className="gap-1">
                  {cert}
                  <button
                    type="button"
                    onClick={() => removeCertification(cert)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={newCertification}
                onChange={(e) => {
                  if (e.target.value) {
                    addCertification(e.target.value);
                    setNewCertification("");
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-md"
              >
                <option value="">Select a certification...</option>
                {COMMON_CERTIFICATIONS.filter(
                  (c) => !formData.certifications.includes(c)
                ).map((cert) => (
                  <option key={cert} value={cert}>
                    {cert}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Or type custom certification..."
                value={newCertification}
                onChange={(e) => setNewCertification(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCertification(newCertification);
                    setNewCertification("");
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addCertification(newCertification);
                  setNewCertification("");
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvUrl">CV URL</Label>
            <Input
              id="cvUrl"
              value={formData.cvUrl}
              onChange={(e) =>
                setFormData({ ...formData, cvUrl: e.target.value })
              }
              placeholder="https://example.com/cv.pdf"
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
              {isPending ? "Saving..." : "Update Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
