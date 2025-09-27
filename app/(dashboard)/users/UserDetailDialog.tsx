"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUserDetailDialogStore, useConfirmationDialogStore } from "./page.stores";
import { useChangeUserRole, useToggleUserBan } from "./page.hooks";
import { RoleBadge } from "@/components/RoleBadge";
import { useState } from "react";
import { Ban, CheckCircle, Mail, Calendar, User, Building, Settings } from "lucide-react";

export function UserDetailDialog() {
  const { isOpen, selectedUser, closeDialog } = useUserDetailDialogStore();
  const { openDialog: openConfirmation } = useConfirmationDialogStore();
  const changeRoleMutation = useChangeUserRole();
  const toggleBanMutation = useToggleUserBan();

  const [selectedOrgForRole, setSelectedOrgForRole] = useState<string>("");
  const [newRole, setNewRole] = useState<string>("");
  const [banReason, setBanReason] = useState<string>("");

  if (!selectedUser) return null;

  const handleRoleChange = () => {
    if (!selectedOrgForRole || !newRole) return;

    const orgName = selectedUser.members?.find(m => m.organizationId === selectedOrgForRole)?.organization.name;
    openConfirmation(
      'changeRole',
      'Change User Role',
      `Are you sure you want to change ${selectedUser.name || selectedUser.email}'s role to ${newRole} in ${orgName}?`,
      () => {
        changeRoleMutation.mutate({
          userId: selectedUser.id,
          organizationId: selectedOrgForRole,
          newRole
        });
        closeDialog();
      }
    );
  };

  const handleBanToggle = () => {
    if (selectedUser.banned) {
      openConfirmation(
        'unban',
        'Unban User',
        `Are you sure you want to unban ${selectedUser.name || selectedUser.email}?`,
        () => {
          toggleBanMutation.mutate({
            userId: selectedUser.id,
            banned: false,
            banReason: undefined
          });
          closeDialog();
        }
      );
    } else {
      if (!banReason.trim()) {
        alert('Please provide a ban reason');
        return;
      }
      openConfirmation(
        'ban',
        'Ban User',
        `Are you sure you want to ban ${selectedUser.name || selectedUser.email}? Reason: ${banReason}`,
        () => {
          toggleBanMutation.mutate({
            userId: selectedUser.id,
            banned: true,
            banReason
          });
          closeDialog();
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Details: {selectedUser.name || selectedUser.email}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Name:</span>
                  <p className="text-sm">{selectedUser.name || "Not provided"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <p className="text-sm flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Global Role:</span>
                  <p className="text-sm">{selectedUser.role}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email Verified:</span>
                  <p className="text-sm flex items-center gap-1">
                    {selectedUser.emailVerified ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Ban className="w-3 h-3 text-red-500" />
                        Not verified
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Created:</span>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Last Updated:</span>
                  <p className="text-sm">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Organization Memberships
              </h3>
              <div className="space-y-2">
                {selectedUser.members && selectedUser.members.length > 0 ? (
                  selectedUser.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <p className="text-sm font-medium">{member.organization.name}</p>
                        <p className="text-xs text-muted-foreground">{member.organization.slug}</p>
                      </div>
                      <RoleBadge role={member.role} variant="compact" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No organization memberships</p>
                )}
              </div>
            </div>

            {selectedUser.banned && (
              <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                <h3 className="font-semibold mb-2 text-red-800 flex items-center gap-2">
                  <Ban className="w-4 h-4" />
                  Ban Status
                </h3>
                <div className="space-y-1">
                  <p className="text-sm text-red-700">
                    <span className="font-medium">Status:</span> Banned
                  </p>
                  {selectedUser.banReason && (
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Reason:</span> {selectedUser.banReason}
                    </p>
                  )}
                  {selectedUser.banExpires && (
                    <p className="text-sm text-red-700">
                      <span className="font-medium">Expires:</span> {new Date(selectedUser.banExpires).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Management Actions
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Change Role</label>
                  <div className="space-y-2 mt-1">
                    <Select value={selectedOrgForRole} onValueChange={setSelectedOrgForRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedUser.members?.map((member) => (
                          <SelectItem key={member.organizationId} value={member.organizationId}>
                            {member.organization.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={newRole} onValueChange={setNewRole} disabled={!selectedOrgForRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={handleRoleChange}
                      disabled={!selectedOrgForRole || !newRole}
                      className="w-full"
                      size="sm"
                    >
                      Change Role
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {selectedUser.banned ? 'Unban User' : 'Ban User'}
                  </label>
                  <div className="space-y-2 mt-1">
                    {!selectedUser.banned && (
                      <Textarea
                        placeholder="Ban reason (required)"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        rows={3}
                      />
                    )}

                    <Button
                      onClick={handleBanToggle}
                      variant={selectedUser.banned ? "default" : "destructive"}
                      disabled={!selectedUser.banned && !banReason.trim()}
                      className="w-full"
                      size="sm"
                    >
                      {selectedUser.banned ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Unban User
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Ban User
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-3">Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-2 bg-muted rounded">
                  <p className="text-lg font-semibold">{selectedUser.members?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="text-lg font-semibold">
                    {selectedUser.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">Status</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={closeDialog}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}