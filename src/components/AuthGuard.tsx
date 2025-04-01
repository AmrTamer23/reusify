"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth.client";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Client-side component that prevents authenticated users from accessing routes
 * Redirects to dashboard/home if already authenticated
 */
export default function AuthGuard({
  children,
  redirectTo = "/",
  fallback,
}: AuthGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && session) {
      console.log(`redirecting to ${redirectTo}`);
      // Redirect authenticated users to the specified route
      router.push(redirectTo);
    }
  }, [isPending, session, router, redirectTo]);

  // Show fallback if authenticated and still loading the redirect
  if (!isPending && session) {
    return fallback || <div className="p-8 text-center">Redirecting...</div>;
  }

  // Show children if not authenticated or while checking authentication
  return <>{children}</>;
}
