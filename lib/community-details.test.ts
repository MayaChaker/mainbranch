import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { getCommunityBySlug, listRecentMembers } from "./communities";
import { listLatestPosts } from "./posts";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await Promise.all([Community.init(), Membership.init(), Post.init(), User.init()]);
}, 180_000);

afterEach(async () => {
  await Promise.all([
    Community.deleteMany({}),
    Membership.deleteMany({}),
    Post.deleteMany({}),
    User.deleteMany({}),
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

async function createCommunity(name: string) {
  return Community.create({
    name,
    slug: name.toLowerCase(),
    description: `${name} community.`,
    topics: ["react"],
  });
}

async function join(communityId: mongoose.Types.ObjectId, name: string, day: number) {
  const user = await User.create({ email: `${name}@example.com`, name });
  await Membership.create({
    userId: user._id,
    communityId,
    joinedAt: new Date(2026, 10, day),
  });
  return user;
}

describe("getCommunityBySlug", () => {
  it("returns the community with its member count", async () => {
    const react = await createCommunity("React");
    await join(react._id, "Sara", 1);
    await join(react._id, "Omar", 2);

    const result = await getCommunityBySlug("react");

    expect(result).toMatchObject({
      id: react._id.toString(),
      name: "React",
      slug: "react",
      description: "React community.",
      topics: ["react"],
      memberCount: 2,
    });
  });

  it("returns null for an unknown slug", async () => {
    expect(await getCommunityBySlug("missing")).toBeNull();
  });
});

describe("listRecentMembers", () => {
  it("returns the newest members first, only from that community", async () => {
    const react = await createCommunity("React");
    const python = await createCommunity("Python");
    await join(react._id, "Sara", 1);
    await join(react._id, "Omar", 3);
    await join(react._id, "Lea", 2);
    await join(python._id, "Karim", 4);

    const result = await listRecentMembers(react._id.toString(), 2);

    expect(result.map((m) => m.name)).toEqual(["Omar", "Lea"]);
  });
});

describe("listLatestPosts in one community", () => {
  it("returns only the posts of that community", async () => {
    const react = await createCommunity("React");
    const python = await createCommunity("Python");
    const author = await User.create({ email: "a@example.com", name: "Sara" });
    for (const [title, community] of [["Hooks", react], ["Django", python]] as const) {
      await Post.create({
        title,
        slug: title.toLowerCase(),
        excerpt: "Excerpt.",
        content: "Body",
        communityId: community._id,
        authorId: author._id,
      });
    }

    const result = await listLatestPosts(5, { communityId: react._id.toString() });

    expect(result.map((p) => p.title)).toEqual(["Hooks"]);
  });
});
