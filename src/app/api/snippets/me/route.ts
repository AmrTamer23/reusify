import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// GET all snippets for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession(request);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snippets = await prisma.snippet.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        tags: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(snippets);
  } catch (error) {
    console.error("Error fetching user snippets:", error);
    return NextResponse.json(
      { error: "Failed to fetch snippets" },
      { status: 500 }
    );
  }
}
