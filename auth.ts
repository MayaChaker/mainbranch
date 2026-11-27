import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "@/lib/mongodb-client";
import { connectDB } from "@/lib/db";
import { assignUsername } from "@/lib/assign-username";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient),
  providers: [GitHub, Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await connectDB();
      await assignUsername(user.id, user.name);
    },
  },
});
