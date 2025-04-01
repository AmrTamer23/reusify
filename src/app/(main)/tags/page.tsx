import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserTags, getPopularTags } from "@/app/actions/tags";
import { TagsClient } from "./TagsClient";

export const metadata = {
  title: "Manage Tags | Reusify",
  description: "Manage your code snippet tags",
};

export default async function TagsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null; // Will be handled by middleware
  }

  // Get all tags associated with the user
  const userTagsResult = await getUserTags();
  const userTags = userTagsResult.success ? userTagsResult.tags : [];

  // Get popular tags
  const popularTagsResult = await getPopularTags(10);
  const popularTags = popularTagsResult.success ? popularTagsResult.tags : [];

  return <TagsClient userTags={userTags} popularTags={popularTags} />;
}
