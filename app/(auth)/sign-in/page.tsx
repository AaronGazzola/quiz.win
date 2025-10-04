"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/shadcn.utils";
import { Check, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useGetPasswordLength, useGetUsers, useSignInWithPassword, useVerifyPassword } from "./page.hooks";
import { UserWithOrganization } from "./page.types";

export default function SignInPage() {
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const { data: passwordLength } = useGetPasswordLength();
  const verifyPasswordMutation = useVerifyPassword();
  const { data: users } = useGetUsers(isVerified);
  const signInMutation = useSignInWithPassword();

  const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD;

  useEffect(() => {
    if (devPassword) {
      setPassword(devPassword);
    }
  }, [devPassword]);

  useEffect(() => {
    if (passwordLength && password.length === passwordLength && !isVerified) {
      verifyPasswordMutation.mutate(password, {
        onSuccess: (isValid) => {
          if (isValid) {
            setIsVerified(true);
          } else {
            setTimeout(() => {
              setPassword("");
            }, 1000);
          }
        },
      });
    }
  }, [password, passwordLength, verifyPasswordMutation, isVerified]);

  const handleUserClick = (user: UserWithOrganization) => {
    setLoadingUserId(user.id);
    signInMutation.mutate(
      { email: user.email, password },
      {
        onSettled: () => setLoadingUserId(null),
      }
    );
  };

  const getVerificationIcon = () => {
    if (verifyPasswordMutation.isPending) {
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
    if (verifyPasswordMutation.isSuccess && verifyPasswordMutation.data) {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    if (verifyPasswordMutation.isError || (verifyPasswordMutation.isSuccess && !verifyPasswordMutation.data)) {
      return <X className="h-5 w-5 text-red-500 animate-pulse" />;
    }
    return null;
  };

  const superAdmins = users?.filter((u) => !u.organizationName) || [];
  const healthCareUsers = users?.filter((u) => u.organizationName === "HealthCare Partners") || [];
  const techCorpUsers = users?.filter((u) => u.organizationName === "TechCorp Solutions") || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-md transition-all duration-500", isVerified && "max-w-4xl")}>
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Welcome to LMS</h2>
            <p className="text-muted-foreground mt-2">Development Sign-In</p>
          </div>

          <div className="relative mb-6">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isVerified}
              className={cn("pr-12", isVerified && "bg-muted")}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">{getVerificationIcon()}</div>
          </div>

          {isVerified && users && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
              {superAdmins.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-center">System Administrator</h3>
                  <div className="flex justify-center">
                    {superAdmins.map((user) => (
                      <UserCard key={user.id} user={user} onClick={handleUserClick} isLoading={loadingUserId === user.id} />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {healthCareUsers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-center">HealthCare Partners</h3>
                    <div className="space-y-2">
                      {healthCareUsers.map((user) => (
                        <UserCard key={user.id} user={user} onClick={handleUserClick} isLoading={loadingUserId === user.id} />
                      ))}
                    </div>
                  </div>
                )}

                {techCorpUsers.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-center">TechCorp Solutions</h3>
                    <div className="space-y-2">
                      {techCorpUsers.map((user) => (
                        <UserCard key={user.id} user={user} onClick={handleUserClick} isLoading={loadingUserId === user.id} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function UserCard({
  user,
  onClick,
  isLoading,
}: {
  user: UserWithOrganization;
  onClick: (user: UserWithOrganization) => void;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={() => onClick(user)}
      disabled={isLoading}
      className="w-full flex items-center gap-4 p-3 rounded-lg border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : user.image ? (
          <Image src={user.image} alt={user.name || ""} width={48} height={48} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary/10" />
        )}
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="font-semibold text-base truncate">{user.name}</div>
        <div className="w-full border-t border-muted-foreground/20 my-1" />
        <div className="text-sm text-muted-foreground truncate">{user.email}</div>
      </div>
    </button>
  );
}
