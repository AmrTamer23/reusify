import { SnippetClientView } from "./page.client";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { db } from "../../../../../prisma/instance";

export default async function SnippetPage({
  params,
}: {
  params: { id: string };
}) {
  // Fetch the snippet data on the server
  const snippetPromise = db.snippet.findUnique({
    where: {
      id: params.id,
    },
    include: {
      tags: true,
    },
  });

  return (
    <Suspense fallback={<SnippetSkeleton />}>
      <SnippetClientView snippetPromise={snippetPromise} />
    </Suspense>
  );
}

function SnippetSkeleton() {
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-16" />
            ))}
          </div>

          <Skeleton className="h-48 w-full" />

          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <div className="p-4 border-t flex justify-between">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}
