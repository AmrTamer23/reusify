"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Clock, Star, Copy, Code } from "lucide-react";

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

const sampleSnippets = [
  {
    id: "1",
    title: "NextAuth JWT Setup",
    language: "TypeScript",
    content:
      "const session = await getSession(...);\nif (!session) return null;",
    createdAt: "2023-12-01",
    tags: ["Auth", "Next.js"],
    isFavorite: true,
  },
  {
    id: "2",
    title: "React useDebounce Hook",
    language: "JavaScript",
    content:
      "function useDebounce(value, delay) {\n  const [debouncedValue, setDebouncedValue] = useState(value);\n  // More code...\n}",
    createdAt: "2023-11-15",
    tags: ["React", "Utility"],
    isFavorite: false,
  },
  {
    id: "3",
    title: "Prisma Query with Filtering",
    language: "TypeScript",
    content:
      "const users = await prisma.user.findMany({\n  where: {\n    email: {\n      contains: query,\n    },\n  },\n});",
    createdAt: "2023-11-30",
    tags: ["Database", "API"],
    isFavorite: true,
  },
  {
    id: "4",
    title: "CSS Grid Layout Template",
    language: "CSS",
    content:
      ".grid-container {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));\n  gap: 1rem;\n}",
    createdAt: "2023-10-25",
    tags: ["CSS", "Animation"],
    isFavorite: false,
  },
];

export default function HomePage() {
  const [activeLanguage, setActiveLanguage] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [snippets] = useState(sampleSnippets);

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
    if (
      activeTags.length > 0 &&
      !snippet.tags.some((tag) => activeTags.includes(tag))
    ) {
      return false;
    }

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
                <Card key={snippet.id} className="overflow-hidden">
                  <Link href={`/snippet/${snippet.id}`}>
                    <CardHeader className="pb-2 pt-4 px-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-medium">
                          {snippet.title}
                        </CardTitle>
                        {snippet.isFavorite && (
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                    </CardHeader>
                  </Link>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{snippet.language}</Badge>
                      {snippet.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <pre className="bg-secondary/50 p-3 rounded-md overflow-x-auto font-mono text-xs leading-relaxed max-h-32">
                      <code>{snippet.content}</code>
                    </pre>
                  </CardContent>
                  <CardFooter className="flex justify-between py-2 px-4 bg-muted/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{snippet.createdAt}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Copy
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
