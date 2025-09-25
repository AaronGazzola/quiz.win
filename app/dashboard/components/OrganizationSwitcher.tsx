"use client";

import { ChevronDown } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface OrganizationSwitcherProps {
  organizations: Organization[];
  selectedOrganization: string;
  onOrganizationChange: (orgId: string) => void;
}

export function OrganizationSwitcher({
  organizations,
  selectedOrganization,
  onOrganizationChange,
}: OrganizationSwitcherProps) {
  const currentOrg = organizations.find(org =>
    org.id === (selectedOrganization || organizations[0]?.id)
  );

  return (
    <div className="relative">
      <select
        value={selectedOrganization || organizations[0]?.id || ""}
        onChange={(e) => onOrganizationChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name} ({org.role})
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}