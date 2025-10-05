"use client";

import { useGetUser, useAdminAccess, useCreateOrganization, useGetAllOrganizations } from "@/app/layout.hooks";
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
import { useState, useEffect, useMemo } from "react";
import { AddOrganizationDialog } from "./AddOrganizationDialog";

export function OrganizationSelector() {
  const { data: user } = useGetUser();
  const { data: allOrganizations } = useGetAllOrganizations();
  const { selectedOrganizationIds, setSelectedOrganizationIds } =
    useAppStore();

  const hasAdminAccess = useAdminAccess();
  const createOrgMutation = useCreateOrganization();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const isSuperAdminUser = isSuperAdmin(user || null);

  const organizations = useMemo(() => {
    return isSuperAdminUser && allOrganizations
      ? allOrganizations.map((org) => ({
          id: org.id,
          name: org.name,
          role: "admin" as const,
        }))
      : user?.member?.map((memberItem) => ({
          id: memberItem.organizationId,
          name: memberItem.organization.name,
          role: memberItem.role,
        })) || [];
  }, [isSuperAdminUser, allOrganizations, user?.member]);

  const adminStatusByOrg = useMemo(() => {
    return isSuperAdminUser && allOrganizations
      ? Object.fromEntries(allOrganizations.map(org => [org.id, true]))
      : getAdminStatusByOrganization(user || null);
  }, [isSuperAdminUser, allOrganizations, user]);

  const hasPartialAdmin = hasPartialAdminAccess(
    user || null,
    selectedOrganizationIds
  );

  useEffect(() => {
    if (organizations.length > 0 && selectedOrganizationIds.length === 0) {
      const allOrgIds = organizations.map(org => org.id);
      setSelectedOrganizationIds(allOrgIds);
    }
  }, [organizations, selectedOrganizationIds.length, setSelectedOrganizationIds]);

  const handleOrganizationToggle = (orgId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrganizationIds([...selectedOrganizationIds, orgId]);
    } else {
      setSelectedOrganizationIds(selectedOrganizationIds.filter((id) => id !== orgId));
    }
  };

  const handleCreateOrganization = async (name: string) => {
    try {
      await createOrgMutation.mutateAsync(name);
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ["organizations", "all"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
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
