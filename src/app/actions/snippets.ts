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
