import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Community } from "@/models/Community";
import { seedCommunities, type SeedCommunity } from "./seed-communities";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await Community.init();
}, 180_000);

afterEach(async () => {
  await Community.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

const REACT: SeedCommunity = {
  name: "React",
  slug: "react",
  description: "Components and hooks.",
  topics: ["react"],
};
const PYTHON: SeedCommunity = {
  name: "Python",
  slug: "python",
  description: "Python for the web.",
  topics: ["python"],
};

describe("seedCommunities", () => {
  it("creates every community and returns their ids by slug", async () => {
    const ids = await seedCommunities([REACT, PYTHON]);

    expect(await Community.countDocuments()).toBe(2);
    expect([...ids.keys()]).toEqual(["react", "python"]);
  });

  it("does not create duplicates when it runs twice", async () => {
    const first = await seedCommunities([REACT]);
    const second = await seedCommunities([REACT]);

    expect(await Community.countDocuments()).toBe(1);
    expect(second.get("react")).toEqual(first.get("react"));
  });

  it("updates the text of an existing community", async () => {
    await seedCommunities([REACT]);
    await seedCommunities([{ ...REACT, description: "Updated." }]);

    const saved = await Community.findOne({ slug: "react" });
    expect(saved?.description).toBe("Updated.");
  });

  it("leaves other communities untouched", async () => {
    await Community.create({
      name: "Rust",
      slug: "rust",
      description: "Created by hand.",
    });

    await seedCommunities([REACT]);

    expect(await Community.countDocuments()).toBe(2);
  });
});
