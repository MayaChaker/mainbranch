import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { seedCommunities } from "@/lib/seed-communities";
import { COMMUNITIES } from "./seed-data";

async function main() {
  await connectDB();
  console.log(`Seeding communities into ${mongoose.connection.name}...`);
  const ids = await seedCommunities(COMMUNITIES);
  console.log(`Done: ${ids.size} communities.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
