"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { createSnippet } from "@/app/actions/snippets";

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

export default function NewSnippetPage() {
  const router = useRouter();
  const [newSnippet, setNewSnippet] = useState({
    title: "",
    language: "",
    content: "",
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((t) => t !== tag)
        : [...current, tag]
    );
  };

  const handleSave = async () => {
    // Validation
    if (!newSnippet.title.trim()) {
      toast.error("Please provide a title");
      return;
    }

    if (!newSnippet.language) {
      toast.error("Please select a language");
      return;
    }

    if (!newSnippet.content.trim()) {
      toast.error("Please add some code content");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSnippet({
        title: newSnippet.title,
        language: newSnippet.language,
        content: newSnippet.content,
        tags: selectedTags,
      });

      if (result.success) {
        toast.success("Snippet created successfully");
        router.push("/");
      } else {
        toast.error(result.error || "Failed to create snippet");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create snippet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6 md:py-10 mx-auto container">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Create New Snippet</h1>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <Input
            value={newSnippet.title}
            onChange={(e) =>
              setNewSnippet({ ...newSnippet, title: e.target.value })
            }
            className="text-lg font-medium"
            placeholder="Snippet title"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Language</label>
              <Select
                value={newSnippet.language}
                onValueChange={(value) =>
                  setNewSnippet({ ...newSnippet, language: value })
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

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Code Snippet
            </label>
            <Textarea
              value={newSnippet.content}
              onChange={(e) =>
                setNewSnippet({ ...newSnippet, content: e.target.value })
              }
              className="font-mono text-sm min-h-[250px]"
              placeholder="Paste your code snippet here"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
          <Button variant="outline" asChild>
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            onClick={handleSave}
            className="gap-1"
            disabled={isSubmitting}
          >
            <Save className="h-4 w-4" />
            Save Snippet
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
