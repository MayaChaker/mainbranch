import { User } from "../models/User";
import { usernameFromName } from "./username";

const MAX_ATTEMPTS = 5;
const MAX_LENGTH_BEFORE_SUFFIX = 15;

function withSuffix(base: string): string {
  const shortBase = base.slice(0, MAX_LENGTH_BEFORE_SUFFIX).replace(/-+$/, "");
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${shortBase}-${digits}`;
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function currentUsername(userId: string): Promise<string> {
  const user = await User.findById(userId).select("username").lean();
  if (!user?.username) {
    throw new Error(`User ${userId} was not found.`);
  }
  return user.username;
}

export async function assignUsername(
  userId: string,
  name?: string | null,
): Promise<string> {
  const base = usernameFromName(name);

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = attempt === 0 ? base : withSuffix(base);

    try {
      const result = await User.updateOne(
        { _id: userId, username: null },
        { $set: { username: candidate } },
        { runValidators: true },
      );

      if (result.matchedCount === 0) {
        return currentUsername(userId);
      }
      return candidate;
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }
  }

  throw new Error(`Could not find a free username for user ${userId}.`);
}
