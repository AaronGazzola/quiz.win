"use client";

import { useState } from "react";
import { useGetUser, useGetUserMembers, useCreateOrganization } from "@/app/layout.hooks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddOrganizationDialog } from "@/components/AddOrganizationDialog";
import { useSendInvitations } from "./page.hooks";
import { cn } from "@/lib/shadcn.utils";
import { queryClient } from "@/app/layout.providers";
import {
  getAdminStatusByOrganization,
  isSuperAdmin,
} from "@/lib/client-role.utils";

export function InvitePageContent() {
  const { data: user } = useGetUser();
  const { data: userWithMembers } = useGetUserMembers();
  const createOrgMutation = useCreateOrganization();
  const sendInvitationsMutation = useSendInvitations();

  const allOrganizations =
    userWithMembers?.member?.map((memberItem) => ({
      id: memberItem.organizationId,
      name: memberItem.organization.name,
      role: memberItem.role,
    })) || [];

  const adminStatusByOrg = getAdminStatusByOrganization(userWithMembers || null);
  const organizations = allOrganizations.filter((org) => adminStatusByOrg[org.id]);
  const isSuperAdminUser = isSuperAdmin(user || null);
  const loadingOrgs = !userWithMembers;

  const [emails, setEmails] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "member" | "">("");
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [showAddOrgDialog, setShowAddOrgDialog] = useState(false);
  const [emailError, setEmailError] = useState("");

  if (!user) return null;

  const validateEmails = (emailString: string): string[] => {
    if (!emailString.trim()) return [];

    const emailList = emailString
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = emailList.filter(email => emailRegex.test(email));

    if (validEmails.length !== emailList.length) {
      const invalidEmails = emailList.filter(email => !emailRegex.test(email));
      setEmailError(`Invalid email addresses: ${invalidEmails.join(', ')}`);
    } else {
      setEmailError("");
    }

    return validEmails;
  };

  const handleCreateOrganization = async (name: string) => {
    try {
      await createOrgMutation.mutateAsync(name);
      setShowAddOrgDialog(false);
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    } catch {

    }
  };

  const handleSendInvitations = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole || !selectedOrg) {
      return;
    }

    const validEmails = validateEmails(emails);

    if (validEmails.length === 0) {
      setEmailError("Please enter at least one valid email address");
      return;
    }

    try {
      await sendInvitationsMutation.mutateAsync({
        emails: validEmails,
        role: selectedRole,
        organizationId: selectedOrg
      });

      setEmails("");
      setSelectedRole("");
      setSelectedOrg("");
      setEmailError("");
    } catch {

    }
  };

  const isFormValid = selectedRole && selectedOrg && emails.trim() && !emailError;
  const isLoading = sendInvitationsMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          User Invitations
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Invite users to join organizations with specific roles
        </p>
      </div>

      <div className="flex justify-center">
        <form onSubmit={handleSendInvitations} className="bg-card shadow rounded-lg p-6 space-y-6 w-full max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Addresses
          </label>
          <Textarea
            placeholder="Enter email addresses separated by commas...&#10;Example: user1@example.com, user2@example.com"
            value={emails}
            onChange={(e) => {
              setEmails(e.target.value);
              if (emailError) {
                validateEmails(e.target.value);
              }
            }}
            onBlur={() => validateEmails(emails)}
            className={cn(
              "min-h-[100px] border border-input",
              emailError && "border-destructive focus:border-destructive focus:ring-destructive"
            )}
          />
          {emailError && (
            <p className="mt-1 text-sm text-destructive">{emailError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Role
          </label>
          <Select value={selectedRole} onValueChange={(value: "admin" | "member") => setSelectedRole(value)}>
            <SelectTrigger className="border border-input">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Organization Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Organization
          </label>
          <Select value={selectedOrg} onValueChange={setSelectedOrg}>
            <SelectTrigger className="border border-input">
              <SelectValue placeholder={loadingOrgs ? "Loading organizations..." : "Select an organization"} />
            </SelectTrigger>
            <SelectContent>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
              {(isSuperAdminUser ||
                organizations.some((org) => adminStatusByOrg[org.id])) && (
                <div
                  className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-foreground outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent"
                  onClick={() => setShowAddOrgDialog(true)}
                >
                  + Add Organization
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full"
        >
          {isLoading ? "Sending Invitations..." : "Send Invitations"}
        </Button>
        </form>
      </div>

      <AddOrganizationDialog
        open={showAddOrgDialog}
        onOpenChange={setShowAddOrgDialog}
        onConfirm={handleCreateOrganization}
        loading={createOrgMutation.isPending}
      />
    </div>
  );
}