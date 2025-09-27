"use client";

import { useGetUser, useGetUserMembers } from "@/app/layout.hooks";
import { useEffect } from "react";
import { Users, BookOpen, TrendingUp, Settings } from "lucide-react";
import { QuizOverview } from "@/components/QuizOverview";
import { MembersTable } from "@/components/MembersTable";
import { InviteUsersCard } from "@/components/InviteUsersCard";
import { useProcessInvitation, useGetDashboardMetrics } from "./page.hooks";
import { useSearchParams, useRouter } from "next/navigation";
import { queryClient } from "@/app/layout.providers";
import { useAppStore } from "@/app/layout.stores";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: user } = useGetUser();
  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds, setSelectedOrganizationIds } = useAppStore();
  const organizations = userWithMembers?.members?.map(member => ({
    id: member.organizationId,
    name: member.organization.name,
    slug: member.organization.slug || "",
    role: member.role,
  })) || [];
  const processInvitationMutation = useProcessInvitation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const { data: metrics, isLoading: metricsLoading } = useGetDashboardMetrics(selectedOrganizationIds);

  // Initialize with all organizations selected by default
  useEffect(() => {
    if (organizations && organizations.length > 0 && selectedOrganizationIds.length === 0) {
      setSelectedOrganizationIds(organizations.map(org => org.id));
    }
  }, [organizations, selectedOrganizationIds.length, setSelectedOrganizationIds]);

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

                router.replace('/');
              },
              onError: () => {
                router.replace('/');
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

  const selectedOrganizations = organizations?.filter(org =>
    selectedOrganizationIds.includes(org.id)
  ) || [];

  const hasAdminAccess = selectedOrganizations.some(org =>
    org.role === "admin" || org.role === "owner"
  );
  const isSuperAdmin = user.role === "super-admin";

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>

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
              <div className="text-2xl font-bold">
                {metricsLoading ? <Skeleton className="h-8 w-12" /> : metrics?.totalQuizzes ?? 0}
              </div>
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
              <div className="text-2xl font-bold">
                {metricsLoading ? <Skeleton className="h-8 w-12" /> : metrics?.completedToday ?? 0}
              </div>
            </div>
          </div>
        </div>

        {(hasAdminAccess || isSuperAdmin) && (
          <>
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <div className="text-2xl font-bold">
                    {metricsLoading ? <Skeleton className="h-8 w-12" /> : metrics?.teamMembers ?? 0}
                  </div>
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
                  <div className="text-2xl font-bold">
                    {metricsLoading ? <Skeleton className="h-8 w-12" /> : metrics?.activeInvites ?? 0}
                  </div>
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
          <QuizOverview organizationIds={selectedOrganizationIds} />
        </div>

        {/* Admin Section */}
        {(hasAdminAccess || isSuperAdmin) && (
          <div className="space-y-6">
            <MembersTable organizationIds={selectedOrganizationIds} />
            <InviteUsersCard organizationIds={selectedOrganizationIds} />
          </div>
        )}
      </div>
    </div>
  );
}