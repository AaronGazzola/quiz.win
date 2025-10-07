"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  useAcceptInvitation,
  useDeclineInvitation,
  useGetPendingInvitations,
} from "@/app/(dashboard)/layout.hooks";
import { Button } from "@/components/ui/button";

export function InvitationToasts() {
  const { data: invitations } = useGetPendingInvitations();
  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();
  const displayedInvitations = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!invitations || invitations.length === 0) return;

    invitations.forEach((invitation) => {
      if (displayedInvitations.current.has(invitation.id)) return;

      displayedInvitations.current.add(invitation.id);

      toast(
        <div className="flex flex-col gap-3 w-full">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-sm">Organization Invitation</p>
            <p className="text-sm">
              <span className="font-medium">{invitation.inviterName}</span> invited you to join{" "}
              <span className="font-medium">{invitation.organizationName}</span> as a{" "}
              <span className="font-medium">{invitation.role === "admin" ? "Organization Admin" : "Member"}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                acceptMutation.mutate(invitation.id);
                toast.dismiss(invitation.id);
                displayedInvitations.current.delete(invitation.id);
              }}
              disabled={acceptMutation.isPending || declineMutation.isPending}
              className="flex-1"
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                declineMutation.mutate(invitation.id);
                toast.dismiss(invitation.id);
                displayedInvitations.current.delete(invitation.id);
              }}
              disabled={acceptMutation.isPending || declineMutation.isPending}
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        </div>,
        {
          id: invitation.id,
          duration: Infinity,
          dismissible: false,
        }
      );
    });
  }, [invitations, acceptMutation, declineMutation]);

  return null;
}
