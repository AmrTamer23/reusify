import { HomePageClient } from "./page.client";
import { getSnippets } from "../actions/snippets";
import { getTags } from "../actions/tags";

export default async function HomePage() {
  const snippets = getSnippets();
  const tags = getTags();

  return <HomePageClient snippetsPromise={snippets} tagsPromise={tags} />;
}
