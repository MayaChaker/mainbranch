import { connectDB } from "@/lib/db";
import { listPopularCommunities, type CommunityListItem } from "@/lib/communities";
import { listLatestPosts, type PostPreview } from "@/lib/posts";

export type HomeData = {
  communities: CommunityListItem[];
  posts: PostPreview[];
};

const EMPTY: HomeData = { communities: [], posts: [] };

export async function getHomeData(): Promise<HomeData> {
  // CI builds run without a database. The page is then built without
  // live sections; on Vercel the variable exists and real errors still throw.
  if (!process.env.MONGODB_URI) return EMPTY;

  await connectDB();
  const [communities, posts] = await Promise.all([
    listPopularCommunities(3),
    listLatestPosts(4),
  ]);
  return { communities, posts };
}
