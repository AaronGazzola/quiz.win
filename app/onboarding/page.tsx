"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useGetUser } from "@/app/layout.hooks";
import { createProfileAction } from "./page.actions";

export default function OnboardingPage() {
  const { data: user, refetch } = useGetUser();
  const router = useRouter();
  const [preferences, setPreferences] = useState({
    notifications: true,
    theme: "light" as "light" | "dark",
  });

  const createProfile = useMutation({
    mutationFn: createProfileAction,
    onSuccess: () => {
      toast.success("Profile created successfully!");
      refetch();
      router.push("/dashboard");
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "Failed to create profile");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createProfile.mutate({
      userId: user.id,
      preferences,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user.profile?.isOnboardingComplete) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Welcome to LMS!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let&apos;s set up your profile to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Profile Setup
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={preferences.notifications}
                    onChange={(e) =>
                      setPreferences({ ...preferences, notifications: e.target.checked })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Enable email notifications
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Theme Preference
                </label>
                <select
                  value={preferences.theme}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      theme: e.target.value as "light" | "dark"
                    })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={createProfile.isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {createProfile.isPending ? "Setting up..." : "Complete Setup"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}