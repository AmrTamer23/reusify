import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface Snippet {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Array<{
    id: string;
    name: string;
  }>;
}

/**
 * Fetch a snippet by its ID including related tags
 */
export async function getSnippetById(id: string): Promise<Snippet | null> {
  try {
    const snippet = await prisma.snippet.findUnique({
      where: { id },
      include: { tags: true },
    });

    return snippet;
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return null;
  }
}

/**
 * Update a snippet with new data
 */
export async function updateSnippet(
  id: string,
  data: {
    title?: string;
    content?: string;
    language?: string;
    tags?: string[];
  }
): Promise<Snippet | null> {
  try {
    // If tags are provided, handle the tag relationships
    if (data.tags) {
      // First disconnect all existing tags
      await prisma.snippet.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      // Then connect the new tags, creating any that don't exist
      const snippet = await prisma.snippet.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          language: data.language,
          tags: {
            connectOrCreate: data.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
        include: { tags: true },
      });

      return snippet;
    } else {
      // If no tags provided, just update the snippet data
      const snippet = await prisma.snippet.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          language: data.language,
        },
        include: { tags: true },
      });

      return snippet;
    }
  } catch (error) {
    console.error("Error updating snippet:", error);
    return null;
  }
}
