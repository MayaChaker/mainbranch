import type { Types } from "mongoose";
import type { Topic } from "@/constants/topics";
import { Community } from "@/models/Community";

export type SeedCommunity = {
  name: string;
  slug: string;
  description: string;
  topics: Topic[];
};

export async function seedCommunities(
  communities: SeedCommunity[],
): Promise<Map<string, Types.ObjectId>> {
  const ids = new Map<string, Types.ObjectId>();

  for (const community of communities) {
    const saved = await Community.findOneAndUpdate(
      { slug: community.slug },
      { $set: community },
      { upsert: true, returnDocument: "after", runValidators: true },
    );
    if (!saved) throw new Error(`Community ${community.slug} was not saved.`);
    ids.set(community.slug, saved._id);
  }

  return ids;
}
