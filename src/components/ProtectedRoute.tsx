"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth.client";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Client-side component that protects routes by checking authentication status
 * Redirects to login if not authenticated
 */
export default function ProtectedRoute({
  children,
  fallback,
}: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      console.log("redirecting to login");
      // Redirect to login with the current path as the redirect target
      router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`);
    }
  }, [isPending, session, router, pathname]);

  // Show fallback while loading or if not authenticated
  if (isPending || !session) {
    return fallback || <div className="p-8 text-center">Loading...</div>;
  }

  // Show children if authenticated
  return <>{children}</>;
}
