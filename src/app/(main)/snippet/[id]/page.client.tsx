"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Copy,
  Save,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import type { Snippet, Tag } from "@prisma/client";
import { updateSnippet, deleteSnippet } from "@/app/actions/snippets";
import { CodePreview } from "@/components/CodePreview";

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

const availableTags = [
  "React",
  "Next.js",
  "API",
  "Auth",
  "Database",
  "Utility",
  "Animation",
  "Algorithm",
];

export function SnippetClientView({
  snippetPromise,
}: {
  snippetPromise: Promise<(Snippet & { tags: Tag[] }) | null>;
}) {
  const snippetData = use(snippetPromise);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snippet, setSnippet] = useState<(Snippet & { tags: Tag[] }) | null>(
    snippetData
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    snippetData?.tags.map((tag) => tag.name) || []
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const hasLongCode = (snippet?.content.split("\n").length ?? 0) > 15;

  const displayLines = isExpanded ? 1000 : 15;

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!snippet) {
    return (
      <div className="container py-6 md:py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Snippet Not Found</h1>
            <p className="mb-4">
              The snippet you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button asChild>
              <Link href="/">Return Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleTagToggle = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.content);
    toast.success("Copied to clipboard!");
  };

  const handleSave = async () => {
    if (!snippet.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateSnippet({
        id: snippet.id,
        title: snippet.title,
        content: snippet.content,
        language: snippet.language,
        tags: selectedTags,
      });

      if (result.success) {
        setSnippet(result.snippet || null);
        setIsEditing(false);
        toast.success("Snippet updated successfully");
      } else {
        toast.error(result.error || "Failed to update snippet");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this snippet?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await deleteSnippet(snippet.id);

      if (result.success) {
        toast.success("Snippet deleted successfully");

        window.location.href = "/";
      } else {
        toast.error(result.error || "Failed to delete snippet");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-6 md:py-10 mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Snippet" : "View Snippet"}
        </h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          {isEditing ? (
            <Input
              value={snippet.title}
              onChange={(e) =>
                setSnippet({ ...snippet, title: e.target.value })
              }
              className="text-lg font-medium"
              placeholder="Snippet title"
            />
          ) : (
            <div className="flex justify-between items-center">
              <CardTitle className="text-4xl font-semibold">
                {snippet.title}
              </CardTitle>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-lg font-medium mb-1">
                  Language
                </label>
                <Select
                  value={snippet.language}
                  onValueChange={(value) =>
                    setSnippet({ ...snippet, language: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-lg font-medium mb-4">
                  Language
                </label>
                <Badge variant="secondary" className="text-base">
                  {snippet.language}
                </Badge>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            {isEditing ? (
              <>
                <div className="mb-2 w-full">
                  <label className="block text-lg font-medium mb-1">Tags</label>
                </div>
                {availableTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer text-base"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </>
            ) : (
              <>
                {snippet.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="cursor-pointer text-base"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </>
            )}
          </div>

          {!isEditing ? (
            <div className="relative">
              <div className="relative">
                <CodePreview
                  code={snippet.content}
                  language={snippet.language}
                  preview={true}
                  maxLines={displayLines}
                />

                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>

                {!isExpanded && hasLongCode && (
                  <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center h-16 bg-gradient-to-t from-background to-transparent pointer-events-none">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 pointer-events-auto shadow-sm"
                      onClick={toggleExpand}
                    >
                      <ChevronDown size={16} />
                      Show more
                    </Button>
                  </div>
                )}
              </div>

              {isExpanded && hasLongCode && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={toggleExpand}
                  >
                    <ChevronUp size={16} />
                    Show less
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Textarea
              value={snippet.content}
              onChange={(e) =>
                setSnippet({ ...snippet, content: e.target.value })
              }
              className="font-mono text-sm min-h-[200px]"
              placeholder="Paste your code snippet here"
            />
          )}

          <div className="flex justify-between text-sm text-muted-foreground mt-4">
            <span>
              Created: {new Date(snippet.createdAt).toLocaleDateString()}
            </span>
            <span>
              Updated: {new Date(snippet.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="gap-1"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash className="h-4 w-4" />
                  Delete
                </Button>
                <Button
                  onClick={handleSave}
                  className="gap-1"
                  disabled={isSubmitting}
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/">Back to Snippets</Link>
              </Button>
              <Button onClick={() => setIsEditing(true)}>Edit Snippet</Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
