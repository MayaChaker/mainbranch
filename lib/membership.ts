import { Types } from "mongoose";
import { Membership } from "@/models/Membership";

function ids(userId: string, communityId: string) {
  return {
    userId: new Types.ObjectId(userId),
    communityId: new Types.ObjectId(communityId),
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export async function joinCommunity(
  userId: string,
  communityId: string,
): Promise<{ created: boolean }> {
  const key = ids(userId, communityId);
  try {
    const result = await Membership.updateOne(
      key,
      { $setOnInsert: { ...key, joinedAt: new Date() } },
      { upsert: true },
    );
    return { created: result.upsertedCount === 1 };
  } catch (error) {
    // Two joins at the same moment: the unique index lets only one insert win.
    if (isDuplicateKeyError(error)) return { created: false };
    throw error;
  }
}

export async function leaveCommunity(
  userId: string,
  communityId: string,
): Promise<void> {
  await Membership.deleteOne(ids(userId, communityId));
}

export async function isMember(
  userId: string,
  communityId: string,
): Promise<boolean> {
  const found = await Membership.exists(ids(userId, communityId));
  return found !== null;
}
