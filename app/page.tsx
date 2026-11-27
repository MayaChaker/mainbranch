import Link from "next/link";
import { getHomeData } from "@/lib/home";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { PostPreviewCard } from "@/components/posts/PostPreviewCard";
import { DeveloperScene } from "@/components/illustrations/DeveloperScene";

export const revalidate = 300;

const primaryLink =
  "rounded-control bg-accent px-5 py-3 text-[15px] font-medium text-on-accent transition-colors hover:bg-accent-hover";
const secondaryLink =
  "rounded-control border border-border bg-surface px-5 py-3 text-[15px] font-medium text-text transition-colors hover:border-accent";

export default async function HomePage() {
  const { communities, posts } = await getHomeData();
  const [featured, ...others] = posts;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-20 px-6 py-12 md:px-16 md:py-16">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_480px]">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs text-brass-text">~/home</p>
          <h1 className="font-display text-[44px] leading-[1.02] tracking-[-0.02em] text-accent-text md:text-[64px]">
            Where developers <em className="text-brass-text">branch out.</em>
          </h1>
          <p className="max-w-[480px] text-lg leading-relaxed text-text-muted">
            Learn from developers, share what you know, and find the community
            built around your craft.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/communities" className={primaryLink}>
              Explore communities
            </Link>
            <Link href="/signin" className={secondaryLink}>
              Join free
            </Link>
          </div>
        </div>
        <DeveloperScene className="hidden lg:block" />
      </section>

      {communities.length > 0 && (
        <section className="flex flex-col gap-5">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[28px] text-accent-text">
              Popular rooms
            </h2>
            <Link
              href="/communities"
              className="text-sm font-medium text-accent-text underline-offset-4 hover:underline"
            >
              All communities →
            </Link>
          </div>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community, index) => (
              <CommunityCard key={community.id} community={community} index={index} />
            ))}
          </ul>
        </section>
      )}

      {featured && (
        <section className="flex flex-col gap-5">
          <h2 className="font-display text-[28px] text-accent-text">
            Fresh from the community
          </h2>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <PostPreviewCard post={featured} featured />
            {others.length > 0 && (
              <div className="flex flex-col gap-5">
                {others.map((post) => (
                  <PostPreviewCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="flex flex-col items-start gap-5 rounded-container bg-accent px-8 py-10 text-on-accent md:flex-row md:items-center md:justify-between md:px-12">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-[32px] leading-tight">
            Your seat is <em className="text-[#D9C59B]">waiting.</em>
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-[#CFD6C8]">
            Join with GitHub or Google. Reading is free, and joining lets you
            post, comment and keep a reading list.
          </p>
        </div>
        <Link
          href="/signin"
          className="rounded-control bg-bg px-5 py-3 text-[15px] font-medium text-accent-text transition-colors hover:bg-surface"
        >
          Join free
        </Link>
      </section>
    </div>
  );
}
