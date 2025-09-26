"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useState, useEffect } from "react";
import { Users, BookOpen, TrendingUp, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useGetUserOrganizations } from "./quizzes/page.hooks";
import { OrganizationSwitcher } from "./components/OrganizationSwitcher";
import { QuizOverview } from "./components/QuizOverview";
import { MembersTable } from "./components/MembersTable";
import { InviteUsersCard } from "./components/InviteUsersCard";
import { useProcessInvitation } from "./page.hooks";
import { useSearchParams, useRouter } from "next/navigation";
import { queryClient } from "@/app/layout.providers";

export default function DashboardPage() {
  const { data: user } = useGetUser();
  const { data: organizations } = useGetUserOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const processInvitationMutation = useProcessInvitation();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const invitationParam = searchParams.get('invitation');

    if (invitationParam && user) {
      try {
        const invitationData = JSON.parse(decodeURIComponent(invitationParam));

        const { organizationId, role } = invitationData;

        if (organizationId && role) {
          processInvitationMutation.mutate(
            { organizationId, role },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["user"] });
                queryClient.invalidateQueries({ queryKey: ["organizations"] });

                router.replace('/dashboard');
              },
              onError: () => {
                router.replace('/dashboard');
              }
            }
          );
        }
      } catch (error) {
        console.error('Failed to process invitation:', error);
        router.replace('/dashboard');
      }
    }
  }, [searchParams, user, processInvitationMutation, router]);

  if (!user) return null;

  const currentOrgId = selectedOrganization || organizations?.[0]?.id || "";
  const currentOrg = organizations?.find(org => org.id === currentOrgId);
  const isAdmin = currentOrg?.role === "admin" || currentOrg?.role === "owner";
  const isSuperAdmin = user.role === "super-admin";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>

        {organizations && organizations.length > 1 && (
          <OrganizationSwitcher
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onOrganizationChange={setSelectedOrganization}
          />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed Today</p>
              <p className="text-2xl font-bold">-</p>
            </div>
          </div>
        </div>

        {(isAdmin || isSuperAdmin) && (
          <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Settings className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Invites</p>
                  <p className="text-2xl font-bold">-</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Quiz Overview */}
        <div className="space-y-6">
          <QuizOverview organizationId={currentOrgId} />
        </div>

        {/* Admin Section */}
        {(isAdmin || isSuperAdmin) && (
          <div className="space-y-6">
            <MembersTable organizationId={currentOrgId} />
            <InviteUsersCard organizationId={currentOrgId} />
          </div>
        )}
      </div>
    </div>
  );
}