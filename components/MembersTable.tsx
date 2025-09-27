"use client";

import { useState } from "react";
import { Users, Crown, Shield, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";
import { useGetOrganizationMembers, useUpdateMemberRole, useRemoveMember } from "./MembersTable.hooks";

interface MembersTableProps {
  organizationId: string;
}

const roleColors = {
  owner: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  admin: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  member: "bg-secondary text-secondary-foreground",
};

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

export function MembersTable({ organizationId }: MembersTableProps) {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

  const { data: members, isLoading } = useGetOrganizationMembers(organizationId);
  const updateRoleMutation = useUpdateMemberRole();
  const removeMemberMutation = useRemoveMember();

  const handleRoleUpdate = (memberId: string, newRole: string) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
    setEditingMemberId(null);
  };

  const handleRemoveMember = (memberId: string) => {
    if (confirm("Are you sure you want to remove this member?")) {
      removeMemberMutation.mutate(memberId);
    }
  };

  if (!organizationId) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Team Members
        </h2>
        <span className="text-sm text-muted-foreground">
          {members?.length || 0} members
        </span>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !members || members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No members found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User;
            const isEditing = editingMemberId === member.id;

            return (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <select
                        defaultValue={member.role}
                        onChange={(e) => handleRoleUpdate(member.id, e.target.value)}
                        className="text-sm border border-input rounded-md px-2 py-1 bg-background text-foreground focus:ring-2 focus:ring-ring"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button
                        onClick={() => setEditingMemberId(null)}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingMemberId(member.id)}
                        className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                          roleColors[member.role as keyof typeof roleColors]
                        )}
                      >
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                      </button>

                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={removeMemberMutation.isPending}
                        className="p-2 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-md disabled:opacity-50"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}