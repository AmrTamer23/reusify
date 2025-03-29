"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check for authentication on client-side as an additional layer of protection
    const checkAuth = () => {
      const hasCookie = document.cookie.includes("reusify.session_token");
      if (!hasCookie) {
        router.push("/login");
        return;
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="relative min-h-screen flex flex-col px-4">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="w-full border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ by{" "}
            <a
              href="https://github.com/amrtamer23"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              @AmrTamer23
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
