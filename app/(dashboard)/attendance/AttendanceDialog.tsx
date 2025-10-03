"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getAttendanceSessionAction,
  createAttendanceSessionAction,
  bulkMarkAttendanceAction,
} from "./page.actions";
import { getClassroomRoster } from "../classrooms/page.actions";
import { AttendanceStatus } from "@prisma/client";

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  sessionId?: string;
  classroomId: string | null;
  date: string | null;
}

export function AttendanceDialog({
  open,
  onOpenChange,
  onClose,
  sessionId,
  classroomId,
  date,
}: AttendanceDialogProps) {
  const queryClient = useQueryClient();
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, AttendanceStatus>
  >({});

  const { data: session } = useQuery({
    queryKey: ["attendance-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const result = await getAttendanceSessionAction(sessionId);
      return result.data;
    },
    enabled: !!sessionId && open,
  });

  const { data: roster = [] } = useQuery({
    queryKey: ["classroom-roster", classroomId],
    queryFn: async () => {
      if (!classroomId) return [];
      const result = await getClassroomRoster(classroomId);
      return result.data || [];
    },
    enabled: !!classroomId && open,
  });

  useEffect(() => {
    if (session?.records) {
      const map: Record<string, AttendanceStatus> = {};
      session.records.forEach((record: any) => {
        map[record.studentId] = record.status;
      });
      setAttendanceMap(map);
    } else {
      setAttendanceMap({});
    }
  }, [session]);

  const createSessionMutation = useMutation({
    mutationFn: async () => {
      if (!classroomId || !date) throw new Error("Missing required fields");
      return createAttendanceSessionAction(classroomId, new Date(date));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: {
      sessionId: string;
      records: Array<{
        studentId: string;
        status: AttendanceStatus;
        notes?: string;
      }>;
    }) => {
      return bulkMarkAttendanceAction(data.sessionId, data.records);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      onClose();
    },
  });

  const handleSave = async () => {
    try {
      let currentSessionId = sessionId;

      if (!currentSessionId) {
        const result = await createSessionMutation.mutateAsync();
        if (!result.data?.id) throw new Error("Failed to create session");
        currentSessionId = result.data.id;
      }

      const records = Object.entries(attendanceMap).map(
        ([studentId, status]) => ({
          studentId,
          status,
        })
      );

      await markAttendanceMutation.mutateAsync({
        sessionId: currentSessionId,
        records,
      });
    } catch (error) {
      console.error(JSON.stringify(error, null, 0));
    }
  };

  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const markAllPresent = () => {
    const map: Record<string, AttendanceStatus> = {};
    roster.forEach((student: any) => {
      map[student.id] = "Present";
    });
    setAttendanceMap(map);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {sessionId ? "Edit Attendance" : "Mark Attendance"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {roster.length} student{roster.length !== 1 ? "s" : ""}
            </p>
            <Button variant="outline" size="sm" onClick={markAllPresent}>
              Mark All Present
            </Button>
          </div>
          <div className="space-y-2">
            {roster.map((student: any) => (
              <div
                key={student.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <p className="font-medium">{student.user?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Grade {student.grade}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={
                      attendanceMap[student.id] === "Present"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setStatus(student.id, "Present")}
                  >
                    Present
                  </Button>
                  <Button
                    variant={
                      attendanceMap[student.id] === "Absent"
                        ? "destructive"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setStatus(student.id, "Absent")}
                  >
                    Absent
                  </Button>
                  <Button
                    variant={
                      attendanceMap[student.id] === "Late"
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => setStatus(student.id, "Late")}
                  >
                    Late
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                markAttendanceMutation.isPending ||
                createSessionMutation.isPending
              }
            >
              Save Attendance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
