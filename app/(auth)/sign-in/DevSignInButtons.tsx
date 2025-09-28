"use client";

import { getDevUsers, DevUser } from "@/lib/dev-users";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateDevMagicLink } from "./page.actions";

interface DevSignInButtonsProps {
  onSigningIn?: (email: string) => void;
}

export default function DevSignInButtons({ onSigningIn }: DevSignInButtonsProps) {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const handleDevSignIn = async (user: DevUser) => {
    setLoadingUser(user.email);
    onSigningIn?.(user.email);

    try {
      const { data: magicLinkUrl, error } = await generateDevMagicLink(user.email, callbackUrl);

      if (error) {
        console.error("Failed to generate dev magic link:", error);
        return;
      }

      if (magicLinkUrl) {
        window.location.href = magicLinkUrl;
      }
    } catch (error) {
      console.error("Dev sign-in error:", error);
    } finally {
      setLoadingUser(null);
    }
  };

  const devUsers = getDevUsers();

  const UserButton = ({ user, disabled }: { user: DevUser; disabled?: boolean }) => (
    <button
      key={user.email}
      onClick={() => handleDevSignIn(user)}
      disabled={disabled || loadingUser !== null}
      className="w-full text-left px-3 py-2 text-sm border border-amber-300 bg-amber-50 hover:bg-amber-100 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
    >
      <div className="font-medium text-amber-900">{user.name}</div>
      <div className="text-xs text-amber-700">
        {user.role && <span className="font-semibold">{user.role.toUpperCase()}</span>}
        {user.orgRole && <span className="font-semibold">{user.orgRole.toUpperCase()}</span>}
        {" • "}
        {user.email}
      </div>
      {loadingUser === user.email && (
        <div className="text-xs text-amber-600 mt-1">Signing in...</div>
      )}
    </button>
  );

  return (
    <div className="mt-8 p-4 border-2 border-dashed border-amber-400 bg-amber-50/50 rounded-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-amber-900">Development Sign-In</h3>
        <p className="text-sm text-amber-700">Quick sign-in for seeded users (dev only)</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-800">System Admin</h4>
          <UserButton user={devUsers.superAdmin} disabled={loadingUser !== null} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-800">TechCorp Learning</h4>
          <div className="space-y-1">
            {devUsers.techCorp.map((user) => (
              <UserButton key={user.email} user={user} disabled={loadingUser !== null} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-800">EduSoft Academy</h4>
          <div className="space-y-1">
            {devUsers.eduSoft.map((user) => (
              <UserButton key={user.email} user={user} disabled={loadingUser !== null} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-amber-800">DevSkills Institute</h4>
          <div className="space-y-1">
            {devUsers.devSkills.map((user) => (
              <UserButton key={user.email} user={user} disabled={loadingUser !== null} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}