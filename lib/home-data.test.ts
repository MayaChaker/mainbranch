import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { listPopularCommunities } from "./communities";
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

async function community(name: string, members: number) {
  const doc = await Community.create({
    name,
    slug: name.toLowerCase(),
    description: `${name} community.`,
  });
  await Membership.insertMany(
    Array.from({ length: members }, () => ({
      userId: new mongoose.Types.ObjectId(),
      communityId: doc._id,
    })),
  );
  return doc;
}

describe("listPopularCommunities", () => {
  it("returns the communities with the most members first", async () => {
    await community("Python", 1);
    await community("React", 5);
    await community("Go", 3);

    const result = await listPopularCommunities(2);

    expect(result.map((c) => [c.name, c.memberCount])).toEqual([
      ["React", 5],
      ["Go", 3],
    ]);
  });

  it("orders communities with the same count by name", async () => {
    await community("React", 2);
    await community("Django", 2);

    const result = await listPopularCommunities(3);

    expect(result.map((c) => c.name)).toEqual(["Django", "React"]);
  });
});

describe("listLatestPosts", () => {
  it("returns the newest posts with their author and community", async () => {
    const react = await community("React", 0);
    const author = await User.create({ email: "a@example.com", name: "Sara K." });
    for (const [title, day] of [["Old", 1], ["New", 3], ["Middle", 2]] as const) {
      await Post.create({
        title,
        slug: title.toLowerCase(),
        excerpt: `${title} excerpt.`,
        content: "Body",
        communityId: react._id,
        authorId: author._id,
        createdAt: new Date(2026, 10, day),
      });
    }

    const result = await listLatestPosts(2);

    expect(result.map((p) => p.title)).toEqual(["New", "Middle"]);
    expect(result[0]).toMatchObject({
      slug: "new",
      excerpt: "New excerpt.",
      authorName: "Sara K.",
      community: { name: "React", slug: "react" },
    });
    expect(typeof result[0].createdAt).toBe("string");
  });

  it("returns an empty list when there are no posts", async () => {
    expect(await listLatestPosts(3)).toEqual([]);
  });
});
