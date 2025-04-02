import { TagsPageClient } from "./page.client";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";
import { getTags } from "@/app/actions/tags";

export default async function TagsPage() {
  const tagsPromise = getTags();

  return (
    <Suspense fallback={<TagsSkeleton />}>
      <TagsPageClient tagsPromise={tagsPromise} />
    </Suspense>
  );
}

function TagsSkeleton() {
  return (
    <div className="container py-6 md:py-10 mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="p-6 border-b bg-muted/20">
          <Skeleton className="h-6 w-48" />
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
