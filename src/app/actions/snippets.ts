"use server";

import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const prisma = new PrismaClient();

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

    const snippet = await prisma.snippet.create({
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

    const existingSnippet = await prisma.snippet.findUnique({
      where: { id: data.id },
    });

    if (!existingSnippet) {
      throw new Error("Snippet not found");
    }

    if (existingSnippet.userId !== session.user.id) {
      throw new Error("You don't have permission to update this snippet");
    }

    const updatedSnippet = await prisma.snippet.update({
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

    const existingSnippet = await prisma.snippet.findUnique({
      where: { id },
    });

    if (!existingSnippet) {
      throw new Error("Snippet not found");
    }

    if (existingSnippet.userId !== session.user.id) {
      throw new Error("You don't have permission to delete this snippet");
    }

    await prisma.snippet.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete snippet:", error);
    return { success: false, error: (error as Error).message };
  }
}
