"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "../../../prisma/instance";
import type { Snippet } from "@prisma/client";

export async function createSnippet(data: {
  title: string;
  language: string;
  content: string;
  tags: string[];
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const snippet = await db.snippet.create({
      data: {
        title: data.title,
        language: data.language,
        content: data.content,
        userId: session.user.id,
        tags: {
          connectOrCreate: data.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
    });

    return { success: true, snippet };
  } catch (error) {
    console.error("Failed to create snippet:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateSnippet(data: {
  id: string;
  title: string;
  language: string;
  content: string;
  tags: string[];
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const existingSnippet = await db.snippet.findUnique({
      where: { id: data.id },
    });

    if (!existingSnippet) {
      throw new Error("Snippet not found");
    }

    if (existingSnippet.userId !== session.user.id) {
      throw new Error("You don't have permission to update this snippet");
    }

    const updatedSnippet = await db.snippet.update({
      where: { id: data.id },
      data: {
        title: data.title,
        content: data.content,
        language: data.language,
        tags: {
          set: [],
          connectOrCreate: data.tags.map((tag) => ({
            where: { name: tag },
            create: { name: tag },
          })),
        },
      },
      include: {
        tags: true,
      },
    });

    return { success: true, snippet: updatedSnippet };
  } catch (error) {
    console.error("Failed to update snippet:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteSnippet(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const existingSnippet = await db.snippet.findUnique({
      where: { id },
    });

    if (!existingSnippet) {
      throw new Error("Snippet not found");
    }

    if (existingSnippet.userId !== session.user.id) {
      throw new Error("You don't have permission to delete this snippet");
    }

    await db.snippet.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete snippet:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function searchSnippets(query: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const rawResults = await db.$queryRaw`
      SELECT s.* 
      FROM "Snippet" s
      LEFT JOIN "_SnippetTags" st ON s."id" = st."A"
      LEFT JOIN "Tag" t ON st."B" = t."id"
      WHERE s."userId" = ${session.user.id}
      AND (
        LOWER(s."title") LIKE ${`%${query.toLowerCase()}%`} 
        OR LOWER(s."content") LIKE ${`%${query.toLowerCase()}%`}
        OR LOWER(t."name") LIKE ${`%${query.toLowerCase()}%`}
      )
      GROUP BY s."id"
      ORDER BY s."updatedAt" DESC
    `;

    const snippetsWithTags = [];
    for (const rawSnippet of rawResults as Snippet[]) {
      const tags = await db.tag.findMany({
        where: {
          snippets: {
            some: {
              id: rawSnippet.id,
            },
          },
        },
      });

      snippetsWithTags.push({
        ...rawSnippet,
        tags,
      });
    }

    return { success: true, snippets: snippetsWithTags };
  } catch (error) {
    console.error("Failed to search snippets:", error);
    return { success: false, error: (error as Error).message };
  }
}
