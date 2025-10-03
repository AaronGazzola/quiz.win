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
import { Plus } from "lucide-react";
import { useCampusManagement } from "./page.hooks";
import { CampusDialog } from "./CampusDialog";
import { useState } from "react";
import type { Campus } from "@prisma/client";

export function CampusManagementClient() {
  const { campuses, isLoading, stats } = useCampusManagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | undefined>();

  const handleEdit = (campus: Campus) => {
    setSelectedCampus(campus);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCampus(undefined);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campus Management</h1>
          <p className="text-muted-foreground">
            Manage school campuses and their details
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Campus
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">Loading campuses...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Campuses</CardTitle>
            <CardDescription>
              {campuses.length} campus{campuses.length !== 1 ? "es" : ""} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Teachers</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campuses.map((campus) => {
                  const campusStats = stats[campus.id];
                  return (
                    <TableRow key={campus.id}>
                      <TableCell className="font-medium">
                        {campus.name}
                      </TableCell>
                      <TableCell>{campus.location || "—"}</TableCell>
                      <TableCell>{campus.principalName || "—"}</TableCell>
                      <TableCell>{campus.phone || "—"}</TableCell>
                      <TableCell>
                        {campusStats?.totalStudents ?? "—"}
                      </TableCell>
                      <TableCell>
                        {campusStats?.totalTeachers ?? "—"}
                      </TableCell>
                      <TableCell>{campus.capacity || "—"}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(campus)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <CampusDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        campus={selectedCampus}
      />
    </div>
  );
}
