"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon } from "lucide-react";
import { useAttendanceManagement } from "./page.hooks";
import { AttendanceDialog } from "./AttendanceDialog";
import { useState } from "react";

export function AttendanceManagementClient() {
  const {
    sessions,
    isLoading,
    currentCampusId,
    selectedClassroom,
    setSelectedClassroom,
    classrooms,
    selectedDate,
    setSelectedDate,
  } = useAttendanceManagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string>();

  const handleMarkAttendance = (sessionId?: string) => {
    setSelectedSessionId(sessionId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedSessionId(undefined);
  };

  if (!currentCampusId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            Please select a campus to view attendance.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">
            Track and manage student attendance
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select classroom and date</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Classroom</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={selectedClassroom || ""}
                onChange={(e) => setSelectedClassroom(e.target.value || null)}
              >
                <option value="">All Classrooms</option>
                {classrooms.map((classroom) => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <input
                type="date"
                className="w-full mt-1 p-2 border rounded"
                value={selectedDate || ""}
                onChange={(e) => setSelectedDate(e.target.value || null)}
              />
            </div>
          </div>
          {selectedClassroom && selectedDate && (
            <Button onClick={() => handleMarkAttendance()}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Mark Attendance for Selected Date
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Sessions</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${sessions.length} session${sessions.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No attendance sessions found. Mark attendance to create a session.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Classroom</TableHead>
                  <TableHead>Present</TableHead>
                  <TableHead>Absent</TableHead>
                  <TableHead>Late</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(sessions as Array<{ id: string; date: Date; classroomId: string; records: Array<{ status: string }> }>)?.map((session) => {
                  const present = session.records.filter(
                    (r) => r.status === "Present"
                  ).length;
                  const absent = session.records.filter(
                    (r) => r.status === "Absent"
                  ).length;
                  const late = session.records.filter(
                    (r) => r.status === "Late"
                  ).length;
                  const total = session.records.length;

                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{session.classroomId}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{present}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">{absent}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{late}</Badge>
                      </TableCell>
                      <TableCell>{total}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAttendance(session.id)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClose={handleCloseDialog}
        sessionId={selectedSessionId}
        classroomId={selectedClassroom}
        date={selectedDate}
      />
    </div>
  );
}
