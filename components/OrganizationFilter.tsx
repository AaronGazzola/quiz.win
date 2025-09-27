"use client";

import { Check, ChevronDown, Filter } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/shadcn.utils";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface OrganizationFilterProps {
  organizations: Organization[];
  selectedOrganizationIds: string[];
  onOrganizationChange: (orgIds: string[]) => void;
}

export function OrganizationFilter({
  organizations,
  selectedOrganizationIds,
  onOrganizationChange,
}: OrganizationFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOrganization = (orgId: string) => {
    if (selectedOrganizationIds.includes(orgId)) {
      onOrganizationChange(selectedOrganizationIds.filter(id => id !== orgId));
    } else {
      onOrganizationChange([...selectedOrganizationIds, orgId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedOrganizationIds.length === organizations.length) {
      onOrganizationChange([]);
    } else {
      onOrganizationChange(organizations.map(org => org.id));
    }
  };

  const getDisplayText = () => {
    if (selectedOrganizationIds.length === 0) {
      return "No organizations selected";
    } else if (selectedOrganizationIds.length === organizations.length) {
      return "All organizations";
    } else if (selectedOrganizationIds.length === 1) {
      const org = organizations.find(o => o.id === selectedOrganizationIds[0]);
      return org?.name || "1 organization";
    } else {
      return `${selectedOrganizationIds.length} organizations`;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-background border border-input rounded-md px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:border-transparent min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{getDisplayText()}</span>
        </div>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform",
          isOpen && "transform rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          <div className="p-2">
            <button
              onClick={handleSelectAll}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
            >
              <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                {selectedOrganizationIds.length === organizations.length && (
                  <Check className="w-3 h-3" />
                )}
              </div>
              <span className="font-medium">All Organizations</span>
            </button>

            <div className="border-t border-border my-1" />

            {organizations.map((org) => (
              <button
                key={org.id}
                onClick={() => handleToggleOrganization(org.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
              >
                <div className="w-4 h-4 border border-input rounded flex items-center justify-center">
                  {selectedOrganizationIds.includes(org.id) && (
                    <Check className="w-3 h-3" />
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span>{org.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {org.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}