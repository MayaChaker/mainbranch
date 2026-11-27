import { spawn } from "node:child_process";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { seedCommunities } from "@/lib/seed-communities";
import { User } from "@/models/User";
import { COMMUNITIES } from "../scripts/seed-data";
import { E2E_AUTH_SECRET, E2E_PORT, E2E_USER } from "./support/constants";

async function main() {
  const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri("mainbranch-e2e");

  await mongoose.connect(uri);
  await seedCommunities(COMMUNITIES);
  await User.create({
    _id: new mongoose.Types.ObjectId(E2E_USER.id),
    name: E2E_USER.name,
    email: E2E_USER.email,
    username: E2E_USER.username,
  });
  await mongoose.disconnect();

  const server = spawn("npx", ["next", "start", "-p", String(E2E_PORT)], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      MONGODB_URI: uri,
      AUTH_SECRET: E2E_AUTH_SECRET,
      AUTH_TRUST_HOST: "true",
    },
  });

  const stop = async () => {
    server.kill();
    await replSet.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  server.on("exit", async (code) => {
    await replSet.stop();
    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
