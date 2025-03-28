"use client";

import React, { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Code } from "lucide-react";

import type { Snippet, Tag } from "@prisma/client";

// Sample data - would be fetched from API in a real app
const languages = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Rust",
  "Go",
  "HTML",
  "CSS",
  "SQL",
  "Bash",
];

const tags = [
  "React",
  "Next.js",
  "API",
  "Auth",
  "Database",
  "Utility",
  "Animation",
  "Algorithm",
];

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

export function HomePageClient({
  snippetsPromise,
}: {
  snippetsPromise: Promise<(Snippet & { tags: Tag[] })[]>;
}) {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const snippets = use(snippetsPromise);

  const toggleTag = (tag: string) => {
    setActiveTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  };

  const filteredSnippets = snippets.filter((snippet) => {
    // Filter by language if active
    if (activeLanguage && snippet.language !== activeLanguage) {
      return false;
    }

    // Filter by tags if any selected
    // if (
    //   activeTags.length > 0 &&
    //   !snippet.tags.some((tag) => activeTags.includes(tag))
    // ) {
    //   return false;
    // }

    return true;
  });

  return (
    <div className=" py-6 ">
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Sidebar with filters */}
        <aside className="w-full md:w-64 space-y-6">
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Programming Languages</h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((language) => (
                <Badge
                  key={language}
                  variant={activeLanguage === language ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() =>
                    setActiveLanguage(
                      activeLanguage === language ? null : language
                    )
                  }
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-sm">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={activeTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <Button asChild className="w-full">
              <Link href="/new">
                <Code className="mr-2 h-4 w-4" />
                New Snippet
              </Link>
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-6">My Snippets</h1>

          {filteredSnippets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                No snippets match your filter criteria.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setActiveLanguage(null);
                  setActiveTags([]);
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full flex-1">
              {filteredSnippets.map((snippet) => (
                <Card
                  key={snippet.id}
                  className="overflow-hidden hover:shadow-md transition-all border-l-4"
                  style={{
                    borderLeftColor: getLanguageColor(snippet.language),
                  }}
                >
                  <Link
                    href={`/snippet/${snippet.id}`}
                    className="block h-full"
                  >
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
          )}
        </div>
      </div>
    </div>
  );
}
