import { auth } from "@/lib/auth";
import { HomePageClient } from "./page.client";
import { headers } from "next/headers";
import { db } from "../../../prisma/instance";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const snippets = db.snippet.findMany({
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
