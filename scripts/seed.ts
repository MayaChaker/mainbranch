import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
import { Post } from "@/models/Post";
import { COMMUNITIES, DEMO_USER, POSTS } from "./seed-data";

const UPSERT = {
  upsert: true,
  returnDocument: "after",
  runValidators: true,
} as const;

async function seed() {
  await connectDB();
  const dbName = mongoose.connection.name;
  if (dbName === "mainbranch") {
    throw new Error("Refusing to seed the production database.");
  }
  console.log(`Seeding ${dbName}...`);
  const user = await User.findOneAndUpdate(
    { email: DEMO_USER.email },
    { $set: DEMO_USER },
    UPSERT,
  );
  if (!user) {
    throw new Error("Demo user was not saved.");
  }
  const communityIds = new Map<string, mongoose.Types.ObjectId>();
  for (const community of COMMUNITIES) {
    const doc = await Community.findOneAndUpdate(
      { slug: community.slug },
      { $set: community },
      UPSERT,
    );
    if (!doc) throw new Error(`Community ${community.slug} was not saved.`);
    communityIds.set(community.slug, doc._id);
  }
  for (const { communitySlug, ...post } of POSTS) {
    const communityId = communityIds.get(communitySlug);
    if (!communityId) {
      throw new Error(`Unknown community : ${communitySlug}`);
    }
    await Membership.updateOne(
      { userId: user._id, communityId },
      { $setOnInsert: { userId: user._id, communityId } },
      { upsert: true },
    );
    await Post.updateOne(
      { slug: post.slug },
      { $set: { ...post, authorId: user._id, communityId } },
      { upsert: true, runValidators: true },
    );
  }
  console.log(
    `Done: 1 user, ${COMMUNITIES.length} communities, ${POSTS.length} posts.`,
  );
}
seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
