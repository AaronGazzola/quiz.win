"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { cn } from "@/lib/shadcn.utils";
import { Check, Crown, Loader2, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useGetPasswordLength,
  useGetUsers,
  useSignInWithPassword,
  useVerifyPassword,
} from "./page.hooks";
import { UserWithOrganization } from "./page.types";

export default function SignInPage() {
  const [password, setPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  const { data: passwordLength } = useGetPasswordLength();
  const verifyPasswordMutation = useVerifyPassword(
    (isValid) => {
      conditionalLog({ isValid }, { label: LOG_LABELS.AUTH });
      if (isValid) {
        conditionalLog(
          { action: "setIsVerified", value: true },
          { label: LOG_LABELS.AUTH }
        );
        setIsVerified(true);
      } else {
        conditionalLog(
          { action: "passwordInvalid", showError: true },
          { label: LOG_LABELS.AUTH }
        );
        setShowError(true);
        setPassword("");
        setTimeout(() => setShowError(false), 2000);
      }
    },
    () => {
      conditionalLog(
        { action: "verifyPasswordError" },
        { label: LOG_LABELS.AUTH }
      );
      setShowError(true);
      setPassword("");
      setTimeout(() => setShowError(false), 2000);
    }
  );
  const { data: users, isPending: isUsersPending } = useGetUsers(isVerified);
  const signInMutation = useSignInWithPassword();

  const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD;

  useEffect(() => {
    if (devPassword) {
      setPassword(devPassword);
      setIsVerified(true);
    }
  }, [devPassword]);

  useEffect(() => {
    if (
      password.length === passwordLength &&
      !isVerified &&
      !verifyPasswordMutation.isPending
    ) {
      conditionalLog(
        { action: "autoSubmitPassword", passwordLength },
        { label: LOG_LABELS.AUTH }
      );
      verifyPasswordMutation.mutate(password);
    }
  }, [password, passwordLength, isVerified, verifyPasswordMutation]);

  const handleUserClick = (user: UserWithOrganization) => {
    setLoadingUserId(user.id);
    signInMutation.mutate(
      { email: user.email, password },
      {
        onError: () => setLoadingUserId(null),
      }
    );
  };

  const getVerificationIcon = () => {
    if (verifyPasswordMutation.isPending) {
      return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
    }
    if (isVerified) {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    if (showError) {
      return <X className="h-5 w-5 text-red-500" />;
    }
    return null;
  };

  const superAdmins = users?.filter((u) => u.role === "super-admin") || [];
  const healthCareUsers =
    users?.filter(
      (u) =>
        u.organizations.length === 1 &&
        u.organizations[0].organizationName === "HealthCare Partners"
    ) || [];
  const techCorpUsers =
    users?.filter(
      (u) =>
        u.organizations.length === 1 &&
        u.organizations[0].organizationName === "TechCorp Solutions"
    ) || [];
  const multiOrgUsers = users?.filter((u) => u.organizations.length > 1) || [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card
        className={cn(
          "w-full max-w-2xl transition-all duration-500 border !border-secondary",
          isVerified && "max-w-4xl"
        )}
      >
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Welcome to Quiz.Win</h2>
            <p className="text-muted-foreground mt-2">
              This is a portfolio project by
              <br />
              <a
                href="https://gazzola.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium italic underline"
              >
                Aaron Gazzola
              </a>
            </p>
          </div>

          {devPassword && isUsersPending ? (
            <div className="flex items-center justify-center mb-6 h-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !devPassword && !isVerified ? (
            <div className="relative mb-6">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isVerified || verifyPasswordMutation.isPending}
                className={cn("pr-12", isVerified && "bg-muted")}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {getVerificationIcon()}
              </div>
            </div>
          ) : null}

          {isVerified && users && (
            <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 flex flex-col items-center">
              {superAdmins.length > 0 && (
                <div className="space-y-3 w-1/2 p-2 rounded-xl">
                  <h3 className="text-lg font-semibold text-center">
                    System Administrator
                  </h3>
                  <div className="flex justify-center">
                    {superAdmins.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onClick={handleUserClick}
                        isLoading={loadingUserId === user.id}
                        isAnyLoading={loadingUserId !== null}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {healthCareUsers.length > 0 && (
                  <div className="space-y-3 rounded-xl p-2">
                    <h3 className="text-lg font-semibold text-center">
                      HealthCare Partners
                    </h3>
                    <div className="space-y-2">
                      {healthCareUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onClick={handleUserClick}
                          isLoading={loadingUserId === user.id}
                          isAnyLoading={loadingUserId !== null}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {techCorpUsers.length > 0 && (
                  <div className="space-y-3 rounded-xl p-2">
                    <h3 className="text-lg font-semibold text-center ">
                      TechCorp Solutions
                    </h3>
                    <div className="space-y-2">
                      {techCorpUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onClick={handleUserClick}
                          isLoading={loadingUserId === user.id}
                          isAnyLoading={loadingUserId !== null}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {multiOrgUsers.length > 0 && (
                <div className="space-y-3 w-full max-w-md p-2 rounded-xl">
                  <h3 className="text-lg font-semibold text-center">
                    Multi-Organization Users
                  </h3>
                  <div className="space-y-2">
                    {multiOrgUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onClick={handleUserClick}
                        isLoading={loadingUserId === user.id}
                        isAnyLoading={loadingUserId !== null}
                      />
                    ))}
                  </div>
                </div>
              )}
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
  isAnyLoading,
}: {
  user: UserWithOrganization;
  onClick: (user: UserWithOrganization) => void;
  isLoading: boolean;
  isAnyLoading: boolean;
}) {
  const getRoleIcon = (orgName: string, role: string) => {
    const isHealthCare = orgName === "HealthCare Partners";
    const color = isHealthCare ? "text-orange-600" : "text-blue-600";

    if (role === "admin" || role === "owner") {
      return <Crown className={cn("h-4 w-4", color)} />;
    }
    return <User className={cn("h-4 w-4", color)} />;
  };

  const getRoleTooltip = (orgName: string, role: string) => {
    const orgShortName =
      orgName === "HealthCare Partners" ? "HealthCare" : "TechCorp";
    const roleLabel =
      role === "owner" ? "Owner" : role === "admin" ? "Admin" : "Member";
    return `${orgShortName} ${roleLabel}`;
  };

  return (
    <TooltipProvider>
      <button
        onClick={() => onClick(user)}
        disabled={isAnyLoading}
        className={cn(
          "w-full flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors relative",
          isAnyLoading && !isLoading && "opacity-50 cursor-not-allowed",
          isAnyLoading && "cursor-not-allowed"
        )}
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : user.image ? (
            <Image
              src={user.image}
              alt={user.name || ""}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-primary/10" />
          )}
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="font-semibold text-base truncate">{user.name}</div>
          <div className="w-full border-t border-muted-foreground/20 my-1" />
          <div className="text-sm text-muted-foreground truncate">
            {user.email}
          </div>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          {user.role === "super-admin" && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-6 h-6 rounded-full !border !border-yellow-700 !dark:border-yellow-500 flex items-center justify-center">
                  <Crown className="h-3.5 w-3.5 text-yellow-700  dark:text-yellow-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>System Administrator</p>
              </TooltipContent>
            </Tooltip>
          )}
          {user.organizations.map((org) => (
            <Tooltip key={org.organizationName}>
              <TooltipTrigger asChild>
                <div>{getRoleIcon(org.organizationName, org.role)}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getRoleTooltip(org.organizationName, org.role)}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </button>
    </TooltipProvider>
  );
}
