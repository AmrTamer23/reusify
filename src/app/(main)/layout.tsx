import React from "react";
import { Navbar } from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col px-4">
      <Navbar />
      <main className="flex-1 ">{children}</main>
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
