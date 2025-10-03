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
import { Plus } from "lucide-react";
import { useClassroomManagement } from "./page.hooks";
import { ClassroomDialog } from "./ClassroomDialog";
import { EnrollmentDialog } from "./EnrollmentDialog";
import { useState } from "react";
import type { ClassroomWithDetails } from "./page.actions";

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

export function ClassroomManagementClient() {
  const {
    classrooms,
    isLoading,
    currentCampusId,
    gradeFilter,
    setGradeFilter,
    subjectFilter,
    setSubjectFilter,
  } = useClassroomManagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<
    ClassroomWithDetails | undefined
  >();

  const handleEdit = (classroom: ClassroomWithDetails) => {
    setSelectedClassroom(classroom);
    setDialogOpen(true);
  };

  const handleManageEnrollment = (classroom: ClassroomWithDetails) => {
    setSelectedClassroom(classroom);
    setEnrollmentDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedClassroom(undefined);
  };

  const handleCloseEnrollmentDialog = () => {
    setEnrollmentDialogOpen(false);
    setSelectedClassroom(undefined);
  };

  if (!currentCampusId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            Please select a campus to view classrooms.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Classroom Management</h1>
          <p className="text-muted-foreground">
            Manage classrooms, teachers, and student enrollment
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Classroom
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter classrooms by grade and subject</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 border rounded-md min-w-[150px]"
          >
            <option value="">All Grades</option>
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 border rounded-md min-w-[150px]"
          >
            <option value="">All Subjects</option>
            {SUBJECT_OPTIONS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">Loading classrooms...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Classrooms</CardTitle>
            <CardDescription>
              {classrooms.length} classroom{classrooms.length !== 1 ? "s" : ""}{" "}
              in this campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Enrollment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classrooms.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No classrooms found. Create a classroom to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  classrooms.map((classroom) => (
                    <TableRow key={classroom.id}>
                      <TableCell className="font-medium">
                        {classroom.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{classroom.grade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{classroom.subject}</Badge>
                      </TableCell>
                      <TableCell>{classroom.teacher.user.name}</TableCell>
                      <TableCell>{classroom.room || "—"}</TableCell>
                      <TableCell>
                        {classroom.students.length}
                        {classroom.capacity && ` / ${classroom.capacity}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(classroom)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleManageEnrollment(classroom)}
                          >
                            Enroll
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ClassroomDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        classroom={selectedClassroom}
        campusId={currentCampusId}
      />

      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={handleCloseEnrollmentDialog}
        classroom={selectedClassroom}
        campusId={currentCampusId}
      />
    </div>
  );
}
