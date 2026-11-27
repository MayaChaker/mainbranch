import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { Community } from "@/models/Community";
import { Membership } from "@/models/Membership";

const session = vi.hoisted(() => ({ current: null as null | { user: { id: string } } }));

vi.mock("@/auth", () => ({ auth: vi.fn(async () => session.current) }));
vi.mock("@/lib/db", () => ({ connectDB: vi.fn(async () => undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { GET, POST, DELETE } = await import("./route");

let replSet: MongoMemoryReplSet;
let communityId: string;
const userId = new mongoose.Types.ObjectId().toString();

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replSet.getUri());
  await Promise.all([Community.init(), Membership.init()]);
}, 180_000);

beforeEach(async () => {
  session.current = { user: { id: userId } };
  const react = await Community.create({
    name: "React",
    slug: "react",
    description: "React community.",
  });
  communityId = react._id.toString();
});

afterEach(async () => {
  await Promise.all([Community.deleteMany({}), Membership.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await replSet?.stop();
});

function call(handler: typeof GET, id = communityId) {
  return handler(new Request("http://localhost/api"), {
    params: Promise.resolve({ id }),
  });
}

describe.each([
  ["GET", GET],
  ["POST", POST],
  ["DELETE", DELETE],
])("%s /api/communities/[id]/membership", (_method, handler) => {
  it("returns 401 when signed out", async () => {
    session.current = null;
    expect((await call(handler)).status).toBe(401);
  });

  it("returns 404 for an id that is not valid", async () => {
    expect((await call(handler, "not-an-id")).status).toBe(404);
  });

  it("returns 404 for a community that does not exist", async () => {
    const missing = new mongoose.Types.ObjectId().toString();
    expect((await call(handler, missing)).status).toBe(404);
  });
});

describe("membership flow", () => {
  it("joins with 201, then 200 when already a member", async () => {
    const first = await call(POST);
    const second = await call(POST);

    expect(first.status).toBe(201);
    expect(await first.json()).toEqual({ isMember: true });
    expect(second.status).toBe(200);
    expect(await Membership.countDocuments()).toBe(1);
  });

  it("reports the membership with GET", async () => {
    expect(await (await call(GET)).json()).toEqual({ isMember: false });
    await call(POST);
    expect(await (await call(GET)).json()).toEqual({ isMember: true });
  });

  it("leaves with 204", async () => {
    await call(POST);

    const response = await call(DELETE);

    expect(response.status).toBe(204);
    expect(await Membership.countDocuments()).toBe(0);
  });

  it("uses the user id from the session only", async () => {
    await call(POST);

    const saved = await Membership.findOne();
    expect(saved?.userId.toString()).toBe(userId);
  });
});
