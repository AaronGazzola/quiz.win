"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { getPasswordLengthAction, verifyPasswordAction, getAllUsersAction } from "./page.actions";
import { getUserAction } from "../../layout.actions";
import { useAppStore, useRedirectStore } from "../../layout.stores";
import { Loader2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  image: string | null;
}

function SignInForm() {
  const [password, setPassword] = useState("");
  const [passwordLength, setPasswordLength] = useState<number | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const router = useRouter();
  const { setUser } = useAppStore();
  const { setUserData } = useRedirectStore();

  useEffect(() => {
    const fetchPasswordLength = async () => {
      const { data } = await getPasswordLengthAction();
      setPasswordLength(data);
    };
    fetchPasswordLength();
  }, []);

  useEffect(() => {
    const verifyPassword = async () => {
      if (!passwordLength || password.length !== passwordLength) return;

      setIsVerifying(true);
      const { data: isValid } = await verifyPasswordAction(password);

      if (isValid) {
        const { data: usersData } = await getAllUsersAction();
        if (usersData) {
          setUsers(usersData);
          setIsAuthenticated(true);
        }
      } else {
        setPassword("");
      }
      setIsVerifying(false);
    };

    verifyPassword();
  }, [password, passwordLength]);

  const handleUserSelect = async (user: User) => {
    setLoadingUserId(user.id);

    try {
      const { error } = await signIn.email({
        email: user.email,
        password: password,
      });

      if (error) {
        setLoadingUserId(null);
        return;
      }

      const { data: userData, error: userError } = await getUserAction();

      if (userError) {
        setLoadingUserId(null);
        return;
      }

      if (userData) {
        setUser(userData);
        setUserData(userData);
      }

      router.push(callbackUrl);
    } catch {
      setLoadingUserId(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30";
      case "admin":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getAvatar = (user: User) => {
    if (user.image) return user.image;
    if (user.role === "super-admin") return "👨‍💼";
    return "👤";
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground">Welcome to School LMS</h2>
          <p className="text-muted-foreground mt-2">Enter your password to continue</p>
        </div>

        <div className="bg-card shadow-lg rounded-lg p-8 border border-border">
          <div className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isVerifying}
                className="w-full px-4 py-3 text-lg border border-input bg-background text-foreground rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-center tracking-widest disabled:opacity-50 placeholder:text-muted-foreground"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {isVerifying && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground">Select Your Account</h2>
        <p className="text-muted-foreground mt-2">Choose an account to sign in</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user)}
            disabled={loadingUserId !== null}
            className="relative bg-card hover:bg-accent border-2 border-border hover:border-primary rounded-lg p-6 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left group"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="text-5xl">{getAvatar(user)}</div>

              <div className="text-center w-full">
                <div className="font-semibold text-lg text-foreground truncate">
                  {user.name || user.email}
                </div>

                <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(user.role)}`}>
                  {user.role.toUpperCase()}
                </div>
              </div>

              {loadingUserId === user.id && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}