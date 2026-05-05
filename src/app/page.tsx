import { HomeContent } from "@/components/home-content";
import { getPublishedPublications } from "@/lib/supabase/publications";

export default async function Home() {
  const posts = await getPublishedPublications();

  return <HomeContent posts={posts} />;
}
