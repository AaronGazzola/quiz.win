"use client";

import { useGetUser } from "@/app/layout.hooks";

export default function QuizzesPage() {
  const { data: user } = useGetUser();

  if (!user) return null;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Quizzes
          </h2>
          <p className="text-gray-600 mb-4">
            Quiz management interface will be implemented in Phase 3.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-sm text-yellow-800">
              📝 Coming in Phase 3: Dashboard & Quiz Management
            </p>
            <ul className="text-xs text-yellow-700 mt-2 text-left max-w-md mx-auto">
              <li>• Advanced data table for quiz management</li>
              <li>• Quiz creation and editing interface</li>
              <li>• Organization-scoped access control</li>
              <li>• Response tracking and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}