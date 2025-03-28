import { searchSnippets } from "@/app/actions/snippets";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Code } from "lucide-react";

function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    JavaScript: "#f7df1e",
    TypeScript: "#3178c6",
    Python: "#3776ab",
    Rust: "#dea584",
    Go: "#00add8",
    HTML: "#e34c26",
    CSS: "#264de4",
    SQL: "#e38c00",
    Bash: "#3e474a",
  };
  return colors[language] || "#6b7280";
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getContentLengthLabel(content: string): string {
  const lines = content.split("\n").length;
  return `${lines} line${lines === 1 ? "" : "s"}`;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Please sign in to search snippets.
        </p>
      </div>
    );
  }

  const result = await searchSnippets(query);
  const snippets = result.success && result.snippets ? result.snippets : [];

  return (
    <div className="py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Home</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">
          {query ? `Search results for "${query}"` : "Search Results"}
        </h1>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-4">
            No snippets found matching your search.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/">Return home</Link>
            </Button>
            <Button asChild>
              <Link href="/new">
                <Code className="mr-2 h-4 w-4" />
                Create new snippet
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <p className="mb-6 text-muted-foreground">
            Found {snippets.length} snippet{snippets.length === 1 ? "" : "s"}
          </p>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
            {snippets.map((snippet) => (
              <Card
                key={snippet.id}
                className="overflow-hidden hover:shadow-md transition-all border-l-4"
                style={{
                  borderLeftColor: getLanguageColor(snippet.language),
                }}
              >
                <Link href={`/snippet/${snippet.id}`} className="block h-full">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium line-clamp-2">
                        {snippet.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{snippet.language}</Badge>
                      {snippet.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag.id} variant="outline">
                          {tag.name}
                        </Badge>
                      ))}
                      {snippet.tags.length > 3 && (
                        <Badge variant="outline">
                          +{snippet.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                      <span>{formatDate(snippet.updatedAt)}</span>
                      <span>{getContentLengthLabel(snippet.content)}</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
