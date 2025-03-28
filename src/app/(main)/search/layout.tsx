import { ReactNode } from "react";

export default function SearchLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  );
}
