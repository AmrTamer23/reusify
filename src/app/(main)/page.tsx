import { auth } from "@/lib/auth";
import { HomePageClient } from "./page.client";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const snippets = prisma.snippet.findMany({
    where: {
      userId: session?.user?.id,
    },
    include: {
      tags: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return <HomePageClient snippetsPromise={snippets} />;
}
