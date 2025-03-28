import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "../../../../../prisma/instance";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const snippet = await db.snippet.findUnique({
      where: { id },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!snippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    return NextResponse.json(snippet);
  } catch (error) {
    console.error("Error fetching snippet:", error);
    return NextResponse.json(
      { error: "Failed to fetch snippet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await request.json();
    const { title, content, language, tags } = body;

    // Verify the snippet exists and belongs to the user
    const existingSnippet = await db.snippet.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingSnippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Check ownership
    if (existingSnippet.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden: You don't have permission to modify this snippet",
        },
        { status: 403 }
      );
    }

    // Process tags if provided
    let tagConnections;
    if (tags && Array.isArray(tags)) {
      tagConnections = {
        set: [], // Disconnect all first
        connectOrCreate: tags.map((tagName: string) => ({
          where: { name: tagName },
          create: { name: tagName, id: crypto.randomUUID() },
        })),
      };
    }

    // Update the snippet
    const updatedSnippet = await db.snippet.update({
      where: { id },
      data: {
        title: title,
        content: content,
        language: language,
        tags: tagConnections,
        updatedAt: new Date(),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(updatedSnippet);
  } catch (error) {
    console.error("Error updating snippet:", error);
    return NextResponse.json(
      { error: "Failed to update snippet" },
      { status: 500 }
    );
  }
}

// DELETE a snippet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession(request);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Verify the snippet exists and belongs to the user
    const existingSnippet = await db.snippet.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingSnippet) {
      return NextResponse.json({ error: "Snippet not found" }, { status: 404 });
    }

    // Check ownership
    if (existingSnippet.userId !== session.user.id) {
      return NextResponse.json(
        {
          error: "Forbidden: You don't have permission to delete this snippet",
        },
        { status: 403 }
      );
    }

    // Delete the snippet
    await db.snippet.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Snippet deleted successfully" });
  } catch (error) {
    console.error("Error deleting snippet:", error);
    return NextResponse.json(
      { error: "Failed to delete snippet" },
      { status: 500 }
    );
  }
}
