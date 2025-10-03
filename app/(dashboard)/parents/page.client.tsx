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
import { useParentManagement } from "./page.hooks";
import { ParentDialog } from "./ParentDialog";
import { useState } from "react";
import type { ParentWithUser } from "./page.actions";

export function ParentManagementClient() {
  const { parents, isLoading, currentCampusId } = useParentManagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<
    ParentWithUser | undefined
  >();

  const handleEdit = (parent: ParentWithUser) => {
    setSelectedParent(parent);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedParent(undefined);
  };

  if (!currentCampusId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            Please select a campus to view parents.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Parent Management</h1>
          <p className="text-muted-foreground">
            Manage parent profiles and student relationships
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Parent
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6">Loading parents...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Parents</CardTitle>
            <CardDescription>
              {parents.length} parent{parents.length !== 1 ? "s" : ""} in this
              campus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Primary Contact</TableHead>
                  <TableHead>Children</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      No parents found. Add a parent to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell className="font-medium">
                        {parent.user.name}
                      </TableCell>
                      <TableCell>{parent.user.email}</TableCell>
                      <TableCell>{parent.user.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{parent.relationship}</Badge>
                      </TableCell>
                      <TableCell>
                        {parent.primaryContact ? (
                          <Badge variant="default">Primary</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {parent.students.length > 0 ? (
                            parent.students.map((sp) => (
                              <Badge key={sp.student.id} variant="outline">
                                {sp.student.user.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(parent)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ParentDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        parent={selectedParent}
        campusId={currentCampusId}
      />
    </div>
  );
}
