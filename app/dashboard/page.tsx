"use client";

import { useGetUser } from "@/app/layout.hooks";

export default function DashboardPage() {
  const { data: user } = useGetUser();

  if (!user) return null;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to your dashboard!
          </h2>
          <p className="text-gray-600 mb-4">
            Hello {user.email}, you&apos;re successfully signed in.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">
              User Information:
            </h3>
            <pre className="text-xs text-blue-800">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <p className="text-sm text-gray-500">
            Phase 2 implementation in progress...
          </p>
        </div>
      </div>
    </div>
  );
}