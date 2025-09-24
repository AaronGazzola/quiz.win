"use client";

import { useGetUser } from "@/app/layout.hooks";
import { isSuperAdmin } from "@/lib/role.utils";

export default function AdminPage() {
  const { data: user } = useGetUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Organization Management
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage organizations, users, and roles
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

        {isSuperAdmin(user) && (
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Create Organization
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Super Admin Only
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                <button
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                  onClick={() => alert("Organization creation will be implemented in Phase 3")}
                >
                  Create Organization
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Manage Users
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Role Assignment
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                onClick={() => alert("User management will be implemented in Phase 3")}
              >
                Manage Users
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.828 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Send Invitations
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    Bulk Invites
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <button
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md text-sm"
                onClick={() => alert("Invitation system will be implemented in Phase 3")}
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          🔄 Phase 2 Complete - Phase 3 Preview
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            <strong>✅ Implemented in Phase 2:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Magic link authentication with Better Auth</li>
            <li>User profile onboarding flow</li>
            <li>Role-based access control (admin/super-admin)</li>
            <li>Protected dashboard with navigation</li>
          </ul>
          <p className="mt-4">
            <strong>📋 Coming in Phase 3:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Organization creation and management interface</li>
            <li>Advanced data table for quiz management</li>
            <li>User role assignment and invitation system</li>
            <li>Quiz CRUD operations with organization scoping</li>
          </ul>
        </div>
      </div>
    </div>
  );
}