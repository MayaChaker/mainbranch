import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { User } from "../models/User";
import { assignUsername } from "./assign-username";

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await User.init();
}, 180_000);

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

async function createUser(email: string, name: string, username?: string) {
  const user = await User.create({ email, name, username });
  return user._id.toString();
}

describe("assignUsername", () => {
  it("saves the username made from the name", async () => {
    const id = await createUser("maya@example.com", "Maya Chaker");

    const username = await assignUsername(id, "Maya Chaker");

    expect(username).toBe("maya-chaker");
    const saved = await User.findById(id);
    expect(saved?.username).toBe("maya-chaker");
  });

  it("adds a 4-digit suffix when the username is taken", async () => {
    await createUser("first@example.com", "Maya Chaker", "maya-chaker");
    const id = await createUser("second@example.com", "Maya Chaker");

    const username = await assignUsername(id, "Maya Chaker");

    expect(username).toMatch(/^maya-chaker-\d{4}$/);
  });

  it("keeps a suffixed username within 20 characters", async () => {
    await createUser("first@example.com", "x", "abcdefghij-klmnopqr");
    const id = await createUser("second@example.com", "x");

    const username = await assignUsername(id, "abcdefghij klmnopqr stuvwxyz");

    expect(username.length).toBeLessThanOrEqual(20);
    expect(username).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("does not replace a username the user already has", async () => {
    const id = await createUser("maya@example.com", "Maya Chaker", "maya-dev");

    const username = await assignUsername(id, "Maya Chaker");

    expect(username).toBe("maya-dev");
  });
});
