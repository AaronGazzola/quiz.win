"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/shadcn.utils";
import { Crown, Loader2, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  useGetUsers,
  useSignInWithPassword,
} from "./page.hooks";
import { UserWithOrganization } from "./page.types";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!isDevelopment) {
      router.push("/auth");
    }
  }, [isDevelopment, router]);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  const { data: users, isPending: isUsersPending } = useGetUsers(true);
  const signInMutation = useSignInWithPassword();

  const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD;

  const handleUserClick = (user: UserWithOrganization) => {
    if (!devPassword) {
      console.error(JSON.stringify({error:"DEV_PASSWORD not configured"}));
      return;
    }
    setLoadingUserId(user.id);
    signInMutation.mutate(
      { email: user.email, password: devPassword },
      {
        onError: () => setLoadingUserId(null),
      }
    );
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

  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl transition-all duration-500 border !border-amber-500">
        <CardContent className="pt-6">
          <div className="text-center mb-8">
            <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-3 mb-4">
              <p className="text-amber-700 dark:text-amber-400 font-semibold text-sm">
                🚧 Development Mode - Seeded Test Users
              </p>
            </div>
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

          {isUsersPending ? (
            <div className="flex items-center justify-center mb-6 h-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}

          {users && (
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
        data-testid={`user-card-${user.email}`}
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
