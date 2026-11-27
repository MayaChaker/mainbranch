import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";
import { listCommunities, PAGE_SIZE } from "./communities";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await Promise.all([Community.init(), Membership.init()]);
}, 180_000);

afterEach(async () => {
  await Promise.all([Community.deleteMany({}), Membership.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

async function createCommunity(name: string, description = "A community.") {
  return Community.create({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    description,
  });
}

async function addMembers(communityId: mongoose.Types.ObjectId, count: number) {
  await Membership.insertMany(
    Array.from({ length: count }, () => ({
      userId: new mongoose.Types.ObjectId(),
      communityId,
    })),
  );
}

describe("listCommunities", () => {
  it("lists communities by name with their member count", async () => {
    const react = await createCommunity("React");
    await createCommunity("Python");
    await addMembers(react._id, 3);

    const result = await listCommunities({ page: 1 });

    expect(result.items.map((c) => [c.name, c.memberCount])).toEqual([
      ["Python", 0],
      ["React", 3],
    ]);
    expect(result).toMatchObject({ page: 1, totalPages: 1, total: 2 });
    expect(typeof result.items[0].id).toBe("string");
  });

  it("finds communities by name or description, ignoring case", async () => {
    await createCommunity("React");
    await createCommunity("Node.js Backend", "APIs and databases.");
    await createCommunity("Python");

    const byName = await listCommunities({ search: "REACT", page: 1 });
    const byDescription = await listCommunities({ search: "api", page: 1 });

    expect(byName.items.map((c) => c.name)).toEqual(["React"]);
    expect(byDescription.items.map((c) => c.name)).toEqual(["Node.js Backend"]);
  });

  it("treats regex characters in the search as plain text", async () => {
    await createCommunity("React");
    await createCommunity("Node.js Backend");

    const anything = await listCommunities({ search: ".*", page: 1 });
    const dot = await listCommunities({ search: "node.js", page: 1 });

    expect(anything.items).toEqual([]);
    expect(dot.items.map((c) => c.name)).toEqual(["Node.js Backend"]);
  });

  it("splits the list into pages", async () => {
    for (let i = 1; i <= PAGE_SIZE + 1; i++) {
      await createCommunity(`Community ${String(i).padStart(2, "0")}`);
    }

    const first = await listCommunities({ page: 1 });
    const second = await listCommunities({ page: 2 });

    expect(first.items).toHaveLength(PAGE_SIZE);
    expect(second.items.map((c) => c.name)).toEqual([
      `Community ${PAGE_SIZE + 1}`,
    ]);
    expect(second).toMatchObject({ page: 2, totalPages: 2 });
  });

  it("returns an empty page after the last one", async () => {
    await createCommunity("React");

    const result = await listCommunities({ page: 5 });

    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
  });
});
