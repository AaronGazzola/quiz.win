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
import { useGradesManagement } from "./page.hooks";
import { GradeDialog } from "./GradeDialog";
import { useState } from "react";

const GRADING_PERIODS = [
  "Quarter 1",
  "Quarter 2",
  "Quarter 3",
  "Quarter 4",
  "Semester 1",
  "Semester 2",
  "Final",
];

export function GradesManagementClient() {
  const {
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
  } = useGradesManagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any>();

  const handleCreate = () => {
    setSelectedGrade(undefined);
    setDialogOpen(true);
  };

  const handleEdit = (grade: any) => {
    setSelectedGrade(grade);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedGrade(undefined);
  };

  if (!currentCampusId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            Please select a campus to view grades.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Grades Management</h1>
          <p className="text-muted-foreground">
            Track and manage student grades
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Grade
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter grades by criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <label className="text-sm font-medium">Student</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={selectedStudent || ""}
                onChange={(e) => setSelectedStudent(e.target.value || null)}
              >
                <option value="">All Students</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user?.name} - Grade {student.grade}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Grading Period</label>
              <select
                className="w-full mt-1 p-2 border rounded"
                value={selectedPeriod || ""}
                onChange={(e) => setSelectedPeriod(e.target.value || null)}
              >
                <option value="">All Periods</option>
                {GRADING_PERIODS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
          <CardDescription>
            {isLoading
              ? "Loading..."
              : `${grades.length} grade${grades.length !== 1 ? "s" : ""} found`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {grades.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No grades found. Add grades to track student performance.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Comments</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>{grade.studentId}</TableCell>
                    <TableCell>{grade.subject}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{grade.grade}</Badge>
                    </TableCell>
                    <TableCell>{grade.gradingPeriod}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {grade.comments || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(grade)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <GradeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onClose={handleCloseDialog}
        grade={selectedGrade}
      />
    </div>
  );
}
