"use client";

import { useGetUserMembers } from "@/app/layout.hooks";
import { useAppStore } from "@/app/layout.stores";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAdminStatusByOrganization,
  hasPartialAdminAccess,
  isSuperAdmin,
} from "@/lib/client-role.utils";
import { Building2, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AddOrganizationDialog } from "./AddOrganizationDialog";

export function OrganizationSelector() {
  const { data: userWithMembers } = useGetUserMembers();
  const { user, selectedOrganizationIds, setSelectedOrganizationIds } =
    useAppStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const organizations =
    userWithMembers?.members?.map((member) => ({
      id: member.organizationId,
      name: member.organization.name,
      role: member.role,
    })) || [];

  const adminStatusByOrg = getAdminStatusByOrganization(userWithMembers || null);
  const hasPartialAdmin = hasPartialAdminAccess(
    userWithMembers || null,
    selectedOrganizationIds
  );
  const isSuperAdminUser = isSuperAdmin(user || null);

  const handleOrganizationToggle = (orgId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrganizationIds([...selectedOrganizationIds, orgId]);
    } else {
      setSelectedOrganizationIds(
        selectedOrganizationIds.filter((id) => id !== orgId)
      );
    }
  };

  const handleCreateOrganization = async (name: string) => {
    setIsCreating(true);
    try {
      console.log(JSON.stringify({ action: "creating_organization", name }));
      setShowAddDialog(false);
    } catch (error) {
      console.log(
        JSON.stringify({ action: "create_organization_error", error })
      );
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCount = selectedOrganizationIds.length;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Organization
            {selectedCount > 0 && (
              <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                {selectedCount}
              </span>
            )}
            {hasPartialAdmin && (
              <ShieldAlert className="h-3 w-3 ml-1 text-amber-500" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64"
          align="end"
        >
          {organizations.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No organizations found
            </div>
          ) : (
            <>
              {organizations.map((org) => {
                const isSelected = selectedOrganizationIds.includes(org.id);
                const isAdmin = adminStatusByOrg[org.id];

                return (
                  <DropdownMenuCheckboxItem
                    key={org.id}
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleOrganizationToggle(org.id, checked)
                    }
                    className="flex items-center justify-between"
                  >
                    <span className="flex-1">{org.name}</span>
                    {isAdmin && (
                      <ShieldCheck
                        className="h-3 w-3 text-green-600 ml-2"
                      />
                    )}
                  </DropdownMenuCheckboxItem>
                );
              })}
              <DropdownMenuSeparator />
            </>
          )}

          {(isSuperAdminUser ||
            organizations.some((org) => adminStatusByOrg[org.id])) && (
            <DropdownMenuItem
              onClick={() => setShowAddDialog(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Organization
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AddOrganizationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onConfirm={handleCreateOrganization}
        loading={isCreating}
      />
    </>
  );
}
