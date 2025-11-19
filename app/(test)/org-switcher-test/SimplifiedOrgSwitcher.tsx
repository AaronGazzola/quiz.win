"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Building2, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { TestId } from "@/test.types";

const mockOrganizations = [
  { id: "org-1", name: "HealthCare Partners", isAdmin: true },
  { id: "org-2", name: "TechCorp Solutions", isAdmin: false },
  { id: "org-3", name: "Education Inc", isAdmin: true },
];

export function SimplifiedOrgSwitcher() {
  const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<string[]>([
    "org-1",
    "org-2",
  ]);

  const handleOrganizationToggle = (orgId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrganizationIds([...selectedOrganizationIds, orgId]);
    } else {
      setSelectedOrganizationIds(selectedOrganizationIds.filter((id) => id !== orgId));
    }
  };

  const selectedCount = selectedOrganizationIds.length;

  return (
    <div className="flex flex-col gap-4 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64"
          align="end"
          data-testid={TestId.ORG_SWITCHER}
        >
          {mockOrganizations.map((org) => {
            const isSelected = selectedOrganizationIds.includes(org.id);

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
                {org.isAdmin && (
                  <ShieldCheck
                    className="h-3 w-3 text-green-600 ml-2"
                  />
                )}
              </DropdownMenuCheckboxItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Add Organization
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="text-sm text-muted-foreground">
        Selected: {selectedOrganizationIds.length} organization(s)
      </div>

      <div className="text-xs text-muted-foreground max-w-sm text-center">
        Selected IDs: {selectedOrganizationIds.join(", ") || "none"}
      </div>
    </div>
  );
}
