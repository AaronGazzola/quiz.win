"use client";

import { useGetUserMembers, useAdminAccess, useCreateOrganization, useGetAllOrganizations } from "@/app/layout.hooks";
import { useAppStore } from "@/app/layout.stores";
import { queryClient } from "@/app/layout.providers";
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
  const { data: allOrganizations } = useGetAllOrganizations();
  const { selectedOrganizationIds, setSelectedOrganizationIds } =
    useAppStore();

  console.log(JSON.stringify({t:'OrgSelector:render',sIds:selectedOrganizationIds}));
  const hasAdminAccess = useAdminAccess();
  const createOrgMutation = useCreateOrganization();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isSuperAdminUser = isSuperAdmin(userWithMembers || null);

  const organizations = isSuperAdminUser && allOrganizations
    ? allOrganizations.map((org) => ({
        id: org.id,
        name: org.name,
        role: "admin" as const,
      }))
    : userWithMembers?.members?.map((member) => ({
        id: member.organizationId,
        name: member.campus.name,
        role: member.role,
      })) || [];

  console.log(JSON.stringify({t:'OrgSelector:orgs',count:organizations.length,orgIds:organizations.map(o=>o.id),isSuperAdmin:isSuperAdminUser}));

  const adminStatusByOrg = isSuperAdminUser && allOrganizations
    ? Object.fromEntries(allOrganizations.map(org => [org.id, true]))
    : getAdminStatusByOrganization(userWithMembers || null);
  const hasPartialAdmin = hasPartialAdminAccess(
    userWithMembers || null,
    selectedOrganizationIds
  );

  const handleOrganizationToggle = (orgId: string, checked: boolean) => {
    console.log(JSON.stringify({t:'OrgSelector:toggle',orgId,checked,prevIds:selectedOrganizationIds}));
    if (checked) {
      const newIds = [...selectedOrganizationIds, orgId];
      console.log(JSON.stringify({t:'OrgSelector:adding',newIds}));
      setSelectedOrganizationIds(newIds);
    } else {
      const newIds = selectedOrganizationIds.filter((id) => id !== orgId);
      console.log(JSON.stringify({t:'OrgSelector:removing',newIds}));
      setSelectedOrganizationIds(newIds);
    }
  };

  const handleCreateOrganization = async (name: string) => {
    try {
      await createOrgMutation.mutateAsync(name);
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ["organizations", "all"] });
      queryClient.invalidateQueries({ queryKey: ["user", "members"] });
    } catch {

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
                console.log(JSON.stringify({t:'OrgSelector:renderItem',orgId:org.id,name:org.name,isSelected,isAdmin}));

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

          {hasAdminAccess && (
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
        loading={createOrgMutation.isPending}
      />
    </>
  );
}
