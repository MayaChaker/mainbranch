import type { Topic } from "@/constants/topics";

type SeedCommunity = {
  name: string;
  slug: string;
  description: string;
  topics: Topic[];
};
type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  topics: Topic[];
  communitySlug: string;
};
export const DEMO_USER = {
  name: "MainBranch Team",
  email: "team@example.com",
  username: "mainbranch-team",
  headline: "Sample content for development",
  bio: "This account holds the sample posts created by the seed script.",
  skills: ["nextjs", "mongodb"],
};

export const COMMUNITIES: SeedCommunity[] = [
  {
    name: "React",
    slug: "react",
    description:
      "Components, hooks, server components and everything around React.",
    topics: ["react", "javascript", "typescript", "nextjs"],
  },
  {
    name: "Node.js Backend",
    slug: "nodejs",
    description: "APIs, databases and server-side JavaScript.",
    topics: ["nodejs", "express", "mongodb", "javascript"],
  },
  {
    name: "Python",
    slug: "python",
    description: "Python for the web, scripting and machine learning.",
    topics: ["python", "django", "machine-learning"],
  },
  {
    name: "DevOps & Cloud",
    slug: "devops",
    description: "Git workflows, containers, CI/CD and deployment.",
    topics: ["devops", "docker", "aws", "git"],
  },
  {
    name: "Mobile Development",
    slug: "mobile",
    description: "Building apps with React Native and Flutter.",
    topics: ["react-native", "flutter"],
  },
  {
    name: "Career & Growth",
    slug: "career",
    description: "Learning paths, first jobs, open source and interviews.",
    topics: ["career", "open-source"],
  },
];

export const POSTS: SeedPost[] = [
  {
    title: "Why Server Components changed how I fetch data",
    slug: "server-components-data-fetching",
    excerpt:
      "Reading data directly on the server removed a whole layer of loading states from my pages.",
    content: [
      "## The old way",
      "",
      "Every page fetched data in the browser with `useEffect` and showed a spinner first.",
      "",
      "## The new way",
      "",
      "A Server Component can be `async` and read the data before the HTML is sent:",
      "",
      "```tsx",
      "export default async function Page() {",
      "  const posts = await getLatestPosts();",
      "  return <PostList posts={posts} />;",
      "}",
      "```",
    ].join("\n"),
    topics: ["react", "nextjs"],
    communitySlug: "react",
  },
  {
    title: "Caching a MongoDB connection in serverless functions",
    slug: "caching-mongodb-connection",
    excerpt:
      "Without a cached connection, every request and every hot reload opens a new one.",
    content: [
      "## The problem",
      "",
      "In development, hot reload runs your modules again. Each run opened a new connection.",
      "",
      "## The fix",
      "",
      "Keep the connection and the pending promise on `globalThis`, so every request reuses them.",
    ].join("\n"),
    topics: ["nodejs", "mongodb"],
    communitySlug: "nodejs",
  },
  {
    title: "Git branching for solo developers",
    slug: "git-branching-solo",
    excerpt:
      "Working alone is not a reason to push to main. Branches and pull requests keep main deployable.",
    content: [
      "## One branch per feature",
      "",
      "- `feature/auth`",
      "- `fix/bookmark-state`",
      "",
      "Each branch ends with a pull request and a preview deployment.",
    ].join("\n"),
    topics: ["git", "devops"],
    communitySlug: "devops",
  },
  {
    title: "What I learned planning a project before writing code",
    slug: "planning-before-code",
    excerpt:
      "Routes, data model and API contract first. The code was faster to write once those were clear.",
    content: [
      "## Plan first",
      "",
      "I wrote down the users, the pages, the data and the API before opening the editor.",
      "",
      "## Result",
      "",
      "Fewer rewrites, and every decision has a reason I can explain.",
    ].join("\n"),
    topics: ["career"],
    communitySlug: "career",
  },
];
