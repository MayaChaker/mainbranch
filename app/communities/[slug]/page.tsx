import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getCommunityBySlug, listRecentMembers } from "@/lib/communities";
import { listLatestPosts } from "@/lib/posts";
import { PostPreviewCard } from "@/components/posts/PostPreviewCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const revalidate = 300;

export function generateStaticParams() {
  return [];
}

async function loadCommunity(slug: string) {
  await connectDB();
  return getCommunityBySlug(slug);
}

export async function generateMetadata({
  params,
}: PageProps<"/communities/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const community = await loadCommunity(slug);
  if (!community) return { title: "Community not found — MainBranch" };
  return {
    title: `${community.name} — MainBranch`,
    description: community.description,
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const AVATAR_COLORS = ["#B9774F", "#6D8B61", "#8A6FA8", "#5E7A9A", "#C2915A"];

export default async function CommunityPage({
  params,
}: PageProps<"/communities/[slug]">) {
  const { slug } = await params;
  const community = await loadCommunity(slug);
  if (!community) notFound();

  const [members, posts] = await Promise.all([
    listRecentMembers(community.id, 5),
    listLatestPosts(10, { communityId: community.id }),
  ]);
  const memberLabel = `${community.memberCount.toLocaleString("en-US")} ${
    community.memberCount === 1 ? "member" : "members"
  }`;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10 md:px-16 md:py-14">
      <Link
        href="/communities"
        className="w-fit text-sm text-text-muted underline-offset-4 hover:text-text hover:underline"
      >
        ← All communities
      </Link>

      <header className="flex flex-col gap-5 rounded-container border border-border bg-surface p-8 md:p-10">
        <p className="font-mono text-xs text-brass-text">
          ~/communities/{community.slug}
        </p>
        <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-accent-text md:text-[52px]">
          {community.name}
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-text-muted">
          {community.description}
        </p>
        {community.topics.length > 0 && (
          <p className="font-mono text-xs text-brass-text">
            {community.topics.join(" · ")}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4 border-t border-dashed border-border pt-5">
          {members.length > 0 && (
            <div aria-hidden="true" className="flex">
              {members.map((member, index) => (
                <span
                  key={member.id}
                  className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface text-xs font-semibold text-white first:ml-0"
                  style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                >
                  {initials(member.name)}
                </span>
              ))}
            </div>
          )}
          <p className="text-sm text-text-muted">
            <strong className="font-semibold text-text">{memberLabel}</strong>
            {members[0] && <> · {members[0].name} joined most recently</>}
          </p>
        </div>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-[28px] text-accent-text">
          Latest posts
        </h2>
        {posts.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((post) => (
              <PostPreviewCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No posts yet"
            description={`Nobody has written in ${community.name} yet. Join the community and be the first.`}
          />
        )}
      </section>
    </div>
  );
}
