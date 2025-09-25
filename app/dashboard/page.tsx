"use client";

import { useGetUser } from "@/app/layout.hooks";
import { useState } from "react";
import { Users, BookOpen, TrendingUp, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useGetUserOrganizations } from "./quizzes/page.hooks";
import { OrganizationSwitcher } from "./components/OrganizationSwitcher";
import { QuizOverview } from "./components/QuizOverview";
import { MembersTable } from "./components/MembersTable";
import { InviteUsersCard } from "./components/InviteUsersCard";

export default function DashboardPage() {
  const { data: user } = useGetUser();
  const { data: organizations } = useGetUserOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

  if (!user) return null;

  const currentOrgId = selectedOrganization || organizations?.[0]?.id || "";
  const currentOrg = organizations?.find(org => org.id === currentOrgId);
  const isAdmin = currentOrg?.role === "admin" || currentOrg?.role === "owner";
  const isSuperAdmin = user.role === "super-admin";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>

            {organizations && organizations.length > 1 && (
              <OrganizationSwitcher
                organizations={organizations}
                selectedOrganization={selectedOrganization}
                onOrganizationChange={setSelectedOrganization}
              />
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Quizzes</h3>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
                <p className="text-2xl font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          {(isAdmin || isSuperAdmin) && (
            <>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-purple-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Settings className="w-8 h-8 text-orange-500" />
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Invites</h3>
                    <p className="text-2xl font-semibold text-gray-900">-</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quiz Overview */}
          <div className="space-y-6">
            <QuizOverview organizationId={currentOrgId} />

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/dashboard/quizzes"
                  className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Manage Quizzes
                </Link>

                <Link
                  href="/dashboard/responses"
                  className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  View Responses
                </Link>

                {(isAdmin || isSuperAdmin) && (
                  <Link
                    href="/dashboard/admin"
                    className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
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
    </div>
  );
}