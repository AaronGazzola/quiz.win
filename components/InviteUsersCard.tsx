"use client";

import { useState } from "react";
import { Mail, UserPlus, X, Clock } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";
import {
  useInviteUsers,
  useGetPendingInvitations,
  useRevokeInvitation,
} from "./InviteUsersCard.hooks";

interface InviteUsersCardProps {
  organizationId: string;
}

export function InviteUsersCard({ organizationId }: InviteUsersCardProps) {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState("member");
  const [showPending, setShowPending] = useState(false);

  const inviteMutation = useInviteUsers();
  const { data: pendingInvitations } = useGetPendingInvitations(organizationId);
  const revokeMutation = useRevokeInvitation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const emailList = emails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emailList.length === 0) {
      return;
    }

    inviteMutation.mutate({
      emails: emailList,
      organizationId,
      role,
    });

    setEmails("");
  };

  const handleRevokeInvitation = (invitationId: string) => {
    if (confirm("Are you sure you want to revoke this invitation?")) {
      revokeMutation.mutate(invitationId);
    }
  };

  if (!organizationId) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center">
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Team Members
        </h2>
        {pendingInvitations && pendingInvitations.length > 0 && (
          <button
            onClick={() => setShowPending(!showPending)}
            className="text-sm text-primary hover:text-primary/80 flex items-center"
          >
            <Clock className="w-4 h-4 mr-1" />
            {pendingInvitations.length} pending
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="emails" className="block text-sm font-medium text-foreground mb-2">
            Email Addresses
          </label>
          <textarea
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter email addresses separated by commas or new lines..."
            rows={4}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Separate multiple emails with commas or line breaks
          </p>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-foreground mb-2">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={inviteMutation.isPending || !emails.trim()}
          className={cn(
            "w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors",
            inviteMutation.isPending || !emails.trim()
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Mail className="w-4 h-4 mr-2" />
          {inviteMutation.isPending ? "Sending Invites..." : "Send Invitations"}
        </button>
      </form>

      {showPending && pendingInvitations && pendingInvitations.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-foreground mb-3">Pending Invitations</h3>
          <div className="space-y-3">
            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{invitation.email}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Role: {invitation.role}</span>
                    <span>
                      Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRevokeInvitation(invitation.id)}
                  disabled={revokeMutation.isPending}
                  className="p-1 text-destructive hover:text-destructive/80 hover:bg-destructive/10 rounded-md disabled:opacity-50"
                  title="Revoke invitation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}