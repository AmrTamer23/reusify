"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "../../../prisma/instance";

/**
 * Get all tags for the current user
 */
export async function getUserTags() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Find tags associated with the current user through snippets
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        snippets: {
          select: {
            tags: true,
          },
        },
      },
    });

    // Extract unique tags from snippets
    const tagsMap = new Map();
    user?.snippets.forEach((snippet) => {
      snippet.tags.forEach((tag) => {
        tagsMap.set(tag.id, tag);
      });
    });

    return { success: true, tags: Array.from(tagsMap.values()) };
  } catch (error) {
    console.error("Failed to fetch user tags:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all popular tags across the platform
 */
export async function getPopularTags(limit: number = 10) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Using Prisma's aggregation to find popular tags
    const tagsWithCount = await db.tag.findMany({
      take: limit,
      include: {
        _count: {
          select: { snippets: true },
        },
      },
      orderBy: {
        snippets: {
          _count: "desc",
        },
      },
    });

    // Transform the data to match the expected format
    const tags = tagsWithCount.map((tag) => ({
      id: tag.id,
      name: tag.name,
      count: tag._count.snippets,
    }));

    return { success: true, tags };
  } catch (error) {
    console.error("Failed to fetch popular tags:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Create a new tag and associate it with the current user's snippet
 */
export async function createTag(name: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Check if tag already exists
    const existingTag = await db.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return { success: true, tag: existingTag };
    }

    // Create new tag
    const tag = await db.tag.create({
      data: {
        name,
      },
    });

    return { success: true, tag };
  } catch (error) {
    console.error("Failed to create tag:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Update an existing tag
 */
export async function updateTag(id: string, newName: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Check if user has access to this tag through a snippet
    const userHasTagAccess = await db.snippet.findFirst({
      where: {
        userId: session.user.id,
        tags: {
          some: { id },
        },
      },
    });

    if (!userHasTagAccess) {
      throw new Error("You don't have permission to update this tag");
    }

    // Check if new name already exists
    const existingTag = await db.tag.findUnique({
      where: { name: newName },
    });

    if (existingTag && existingTag.id !== id) {
      throw new Error("A tag with this name already exists");
    }

    const updatedTag = await db.tag.update({
      where: { id },
      data: { name: newName },
    });

    return { success: true, tag: updatedTag };
  } catch (error) {
    console.error("Failed to update tag:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Remove a tag from all of a user's snippets
 */
export async function removeTagFromUserSnippets(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Find all snippets by this user that have this tag
    const snippets = await db.snippet.findMany({
      where: {
        userId: session.user.id,
        tags: {
          some: { id },
        },
      },
    });

    // Remove the tag from each snippet
    for (const snippet of snippets) {
      await db.snippet.update({
        where: { id: snippet.id },
        data: {
          tags: {
            disconnect: { id },
          },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to remove tag from user's snippets:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Delete a tag completely (if the user has permission)
 * This will remove the tag from all associated snippets as well
 */
export async function deleteTag(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Check if user has access to this tag through a snippet
    const userHasTagAccess = await db.snippet.findFirst({
      where: {
        userId: session.user.id,
        tags: {
          some: { id },
        },
      },
    });

    if (!userHasTagAccess) {
      throw new Error("You don't have permission to delete this tag");
    }

    // Delete the tag - relations will be automatically handled by Prisma
    await db.tag.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Search for tags by name
 */
export async function searchTags(query: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Using Prisma to search for tags with the SQLite adapter
    const tags = await db.tag.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      take: 10,
    });

    return { success: true, tags };
  } catch (error) {
    console.error("Failed to search tags:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get all snippets that have a specific tag
 */
export async function getSnippetsByTag(tagId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const snippets = await db.snippet.findMany({
      where: {
        userId: session.user.id,
        tags: {
          some: {
            id: tagId,
          },
        },
      },
      include: {
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return { success: true, snippets };
  } catch (error) {
    console.error("Failed to fetch snippets by tag:", error);
    return { success: false, error: (error as Error).message };
  }
}
