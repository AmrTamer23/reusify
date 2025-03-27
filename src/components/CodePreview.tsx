"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { createHighlighter } from "shiki";
import { useTheme } from "next-themes";

interface CodePreviewProps {
  code: string;
  language: string;
  preview?: boolean;
  maxLines?: number;
}

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighterInstance() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["vitesse-dark", "vitesse-light"],
      langs: [
        "javascript",
        "typescript",
        "python",
        "rust",
        "go",
        "html",
        "css",
        "sql",
        "bash",
      ],
    });
  }
  return highlighterPromise;
}

export function CodePreview({
  code,
  language,
  preview = true,
  maxLines = 5,
}: CodePreviewProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  // Map our app languages to shiki languages
  const getShikiLanguage = (appLanguage: string): string => {
    const mapping: Record<string, string> = {
      JavaScript: "javascript",
      TypeScript: "typescript",
      Python: "python",
      Rust: "rust",
      Go: "go",
      HTML: "html",
      CSS: "css",
      SQL: "sql",
      Bash: "bash",
    };
    return mapping[appLanguage] || "text";
  };

  // Get code preview for card display
  const getPreviewCode = (fullCode: string): string => {
    if (!preview) return fullCode;

    const lines = fullCode.split("\n");
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join("\n") + "\n// ...";
    }
    return fullCode;
  };

  useEffect(() => {
    async function highlight() {
      setIsLoading(true);
      try {
        const highlighter = await getHighlighterInstance();
        if (!highlighter) {
          throw new Error("Failed to load highlighter");
        }
        const shikiLanguage = getShikiLanguage(language);
        const codeToHighlight = getPreviewCode(code);

        const result = highlighter.codeToHtml(codeToHighlight, {
          lang: shikiLanguage,
          theme: theme === "dark" ? "vitesse-dark" : "vitesse-light",
        });

        setHtml(result);
      } catch (error) {
        console.error("Failed to highlight code:", error);
      } finally {
        setIsLoading(false);
      }
    }

    highlight();
  }, [code, language, preview, maxLines, theme]);

  if (isLoading) {
    return <Skeleton className="h-20 w-full" />;
  }

  return (
    <div className="rounded-md overflow-hidden">
      {html ? (
        <div
          className="text-sm font-mono [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <div className="p-3 rounded font-mono text-xs">
          {getPreviewCode(code)}
        </div>
      )}
    </div>
  );
}
