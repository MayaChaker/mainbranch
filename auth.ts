import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { getMongoClient } from "@/lib/mongodb-client";
import { connectDB } from "@/lib/db";
import { assignUsername } from "@/lib/assign-username";
import { User } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(getMongoClient),
  providers: [GitHub, Google],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        await connectDB();
        const saved = await User.findById(user.id).select("username").lean();
        token.username = saved?.username ?? undefined;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      session.user.username = token.username;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await connectDB();
      await assignUsername(user.id, user.name);
    },
  },
});
