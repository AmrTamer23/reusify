"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "../../../prisma/instance";

export async function getTags() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const tags = await db.tag.findMany({
    where: {
      user: {
        id: session.user.id,
      },
    },
    include: {
      _count: {
        select: {
          snippets: true,
        },
      },
    },
  });

  return tags;
}

export async function createTag(data: { name: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    const tag = await db.tag.create({
      data: {
        name: data.name,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    });

    return { success: true, tag };
  } catch (error) {
    console.error("Failed to create tag:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateTag(data: { id: string; name: string }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Verify the tag belongs to the user
    const existingTag = await db.tag.findFirst({
      where: {
        id: data.id,
        user: {
          id: session.user.id,
        },
      },
    });

    if (!existingTag) {
      throw new Error("Tag not found or you don't have permission to edit it");
    }

    const updatedTag = await db.tag.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
      },
    });

    return { success: true, tag: updatedTag };
  } catch (error) {
    console.error("Failed to update tag:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteTag(id: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Not authenticated");
    }

    // Verify the tag belongs to the user
    const existingTag = await db.tag.findFirst({
      where: {
        id,
        user: {
          id: session.user.id,
        },
      },
    });

    if (!existingTag) {
      throw new Error(
        "Tag not found or you don't have permission to delete it"
      );
    }

    await db.tag.delete({
      where: {
        id,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete tag:", error);
    return { success: false, error: (error as Error).message };
  }
}
