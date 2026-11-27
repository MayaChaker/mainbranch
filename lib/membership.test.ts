import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Membership } from "@/models/Membership";
import { isMember, joinCommunity, leaveCommunity } from "./membership";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await Membership.init();
}, 180_000);

afterEach(async () => {
  await Membership.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

const userId = new mongoose.Types.ObjectId().toString();
const communityId = new mongoose.Types.ObjectId().toString();

describe("joinCommunity", () => {
  it("creates a membership the first time", async () => {
    const result = await joinCommunity(userId, communityId);

    expect(result).toEqual({ created: true });
    expect(await Membership.countDocuments()).toBe(1);
  });

  it("does nothing when the user is already a member", async () => {
    await joinCommunity(userId, communityId);

    const result = await joinCommunity(userId, communityId);

    expect(result).toEqual({ created: false });
    expect(await Membership.countDocuments()).toBe(1);
  });

  it("stays at one membership when two joins happen at the same time", async () => {
    const results = await Promise.all([
      joinCommunity(userId, communityId),
      joinCommunity(userId, communityId),
    ]);

    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(await Membership.countDocuments()).toBe(1);
  });
});

describe("leaveCommunity", () => {
  it("removes the membership", async () => {
    await joinCommunity(userId, communityId);

    await leaveCommunity(userId, communityId);

    expect(await isMember(userId, communityId)).toBe(false);
  });

  it("does not fail when the user was not a member", async () => {
    await expect(leaveCommunity(userId, communityId)).resolves.toBeUndefined();
  });
});

describe("isMember", () => {
  it("is true only for the user who joined", async () => {
    await joinCommunity(userId, communityId);
    const otherUser = new mongoose.Types.ObjectId().toString();

    expect(await isMember(userId, communityId)).toBe(true);
    expect(await isMember(otherUser, communityId)).toBe(false);
  });
});
