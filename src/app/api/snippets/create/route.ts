import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, language, tags } = body;

    // Validate required fields
    if (!title || !content || !language) {
      return NextResponse.json(
        { error: "Title, content and language are required" },
        { status: 400 }
      );
    }

    // Create the snippet with tags if provided
    const snippet = await prisma.snippet.create({
      data: {
        id: crypto.randomUUID(),
        title,
        content,
        language,
        userId: session.user.id,
        tags:
          tags && Array.isArray(tags) && tags.length > 0
            ? {
                connectOrCreate: tags.map((tagName: string) => ({
                  where: { name: tagName },
                  create: { name: tagName, id: crypto.randomUUID() },
                })),
              }
            : undefined,
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(snippet, { status: 201 });
  } catch (error) {
    console.error("Error creating snippet:", error);
    return NextResponse.json(
      { error: "Failed to create snippet" },
      { status: 500 }
    );
  }
}
