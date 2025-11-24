"use client";

import { useGetUser, useAdminAccess, useCreateOrganization } from "@/app/layout.hooks";
import { useAppStore } from "@/app/layout.stores";
import { queryClient } from "@/app/layout.providers";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  getAdminStatusByOrganization,
  hasPartialAdminAccess,
} from "@/lib/client-role.utils";
import { Building2, Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState, useMemo } from "react";
import { AddOrganizationDialog } from "./AddOrganizationDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TestId } from "@/test.types";
import { cn } from "@/lib/shadcn.utils";
import * as Checkbox from "@radix-ui/react-checkbox";

export function OrganizationSelector() {
  const { user, selectedOrganizationIds, setSelectedOrganizationIds } =
    useAppStore();
  const { isLoading } = useGetUser();
  const [open, setOpen] = useState(false);

  const hasAdminAccess = useAdminAccess();
  const createOrgMutation = useCreateOrganization();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const organizations = useMemo(() => {
    return user?.member?.map((memberItem) => ({
      id: memberItem.organizationId,
      name: memberItem.organization.name,
      role: memberItem.role,
    })) || [];
  }, [user?.member]);

  const adminStatusByOrg = useMemo(() => {
    return getAdminStatusByOrganization(user || null);
  }, [user]);

  const hasPartialAdmin = hasPartialAdminAccess(
    user || null,
    selectedOrganizationIds
  );

  const allOrgIds = useMemo(() => organizations.map(org => org.id), [organizations]);

  const handleOrganizationToggle = (orgId: string, checked: boolean) => {
    let newIds: string[];
    if (checked) {
      const currentIds = selectedOrganizationIds.length === 0 ? allOrgIds : selectedOrganizationIds;
      newIds = [...currentIds, orgId];
    } else {
      const currentIds = selectedOrganizationIds.length === 0 ? allOrgIds : selectedOrganizationIds;
      newIds = currentIds.filter((id) => id !== orgId);
    }
    if (newIds.length === 0) {
      setSelectedOrganizationIds([]);
    } else if (newIds.length === allOrgIds.length && allOrgIds.every(id => newIds.includes(id))) {
      setSelectedOrganizationIds([]);
    } else {
      setSelectedOrganizationIds(newIds);
    }
  };

  const handleCreateOrganization = async (name: string) => {
    try {
      await createOrgMutation.mutateAsync(name);
      setShowAddDialog(false);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch {

    }
  };

  const selectedCount = selectedOrganizationIds.length === 0 ? organizations.length : selectedOrganizationIds.length;

  if (isLoading) {
    return (
      <Skeleton className="h-10 w-32 rounded-full" />
    );
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full"
            data-testid={TestId.ORG_SELECTOR}
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
        </PopoverTrigger>
        <PopoverContent
          className="w-64 p-0"
          align="end"
          data-testid={TestId.ORG_SWITCHER}
        >
          {organizations.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No organizations found
            </div>
          ) : (
            <>
              <div className="p-2 space-y-1">
                {organizations.map((org) => {
                  const isSelected = selectedOrganizationIds.length === 0 || selectedOrganizationIds.includes(org.id);
                  const isAdmin = adminStatusByOrg[org.id];

                  return (
                    <div
                      key={org.id}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 rounded-sm cursor-pointer hover:bg-accent",
                        isSelected && "bg-accent/50"
                      )}
                      onClick={() => handleOrganizationToggle(org.id, !isSelected)}
                      data-organization-id={org.id}
                      data-organization-name={org.name}
                      data-state={isSelected ? "checked" : "unchecked"}
                    >
                      <Checkbox.Root
                        checked={isSelected}
                        className="h-4 w-4 border border-primary rounded flex items-center justify-center data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      >
                        <Checkbox.Indicator>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            />
                          </svg>
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      <span className="flex-1 text-sm">{org.name}</span>
                      {isAdmin && (
                        <ShieldCheck
                          className="h-3 w-3 text-green-600"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="border-t" />
            </>
          )}

          {hasAdminAccess && (
            <div
              onClick={() => {
                setShowAddDialog(true);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm cursor-pointer hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              Add Organization
            </div>
          )}
        </PopoverContent>
      </Popover>

      <AddOrganizationDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onConfirm={handleCreateOrganization}
        loading={createOrgMutation.isPending}
      />
    </>
  );
}
