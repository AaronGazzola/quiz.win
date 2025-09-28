"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserRoleManagementDialogStore, useConfirmationDialogStore } from "./page.stores";
import { useUpdateMultipleUserRoles } from "./page.hooks";
import { Users } from "lucide-react";

export function UserRoleManagementDialog() {
  const {
    isOpen,
    selectedUser,
    organizationRoles,
    closeDialog,
    updateRole,
    resetRoles
  } = useUserRoleManagementDialogStore();

  const { openDialog: openConfirmation } = useConfirmationDialogStore();
  const updateRolesMutation = useUpdateMultipleUserRoles();

  const handleCancel = () => {
    resetRoles();
    closeDialog();
  };

  const handleSave = () => {
    const changes = organizationRoles.filter(org => org.currentRole !== org.newRole);

    if (changes.length === 0) {
      closeDialog();
      return;
    }

    const changesList = changes.map(org =>
      `${org.organizationName}: ${org.currentRole} → ${org.newRole}`
    ).join('\n');

    openConfirmation(
      'saveRoles',
      'Confirm Role Changes',
      `Are you sure you want to update the following roles for ${selectedUser?.name || selectedUser?.email}?\n\n${changesList}`,
      () => {
        const roleChanges = changes.map(org => ({
          organizationId: org.organizationId,
          newRole: org.newRole
        }));

        updateRolesMutation.mutate({
          userId: selectedUser!.id,
          roleChanges
        });

        closeDialog();
      }
    );
  };

  if (!selectedUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Roles: {selectedUser.name || selectedUser.email}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {organizationRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shared organizations found
            </div>
          ) : (
            organizationRoles.map((org) => (
              <div key={org.organizationId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{org.organizationName}</h3>
                  <p className="text-sm text-muted-foreground">
                    Current role: {org.currentRole}
                  </p>
                </div>
                <div className="w-40">
                  <Select
                    value={org.newRole}
                    onValueChange={(value) => updateRole(org.organizationId, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="owner">Owner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}