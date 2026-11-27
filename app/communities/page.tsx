import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { listCommunities } from "@/lib/communities";
import { User } from "@/models/User";
import { communitiesQuerySchema } from "@/schemas/communities";
import { CommunityCard } from "@/components/communities/CommunityCard";
import { CommunitySearch } from "@/components/communities/CommunitySearch";
import { DeveloperScene } from "@/components/illustrations/DeveloperScene";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

export const metadata: Metadata = {
  title: "Communities — MainBranch",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function communitiesHref(search: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/communities?${query}` : "/communities";
}

const linkClass = "text-sm font-medium text-accent-text underline-offset-4 hover:underline";

export default async function CommunitiesPage({
  searchParams,
}: PageProps<"/communities">) {
  const params = await searchParams;
  const parsed = communitiesQuerySchema.safeParse({
    search: firstValue(params.search),
    page: firstValue(params.page),
  });
  if (!parsed.success) redirect("/communities");

  const { search, page } = parsed.data;
  await connectDB();
  const [{ items, totalPages, total }, developers] = await Promise.all([
    listCommunities({ search, page }),
    User.estimatedDocumentCount(),
  ]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-10 md:px-16 md:py-14">
      <section className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_480px]">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-xs text-brass-text">~/communities</p>
          <h1 className="font-display text-[40px] leading-[1.05] tracking-[-0.02em] text-accent-text md:text-[56px]">
            Developers are already talking.{" "}
            <em className="text-brass-text">Pull up a chair.</em>
          </h1>
          <p className="max-w-[480px] leading-relaxed text-text-muted">
            Each community is a small room around one craft. Read freely. Join
            to post, comment and save what you want to read later.
          </p>
          <p className="text-sm text-text-muted">
            <strong className="font-semibold text-text">
              {developers.toLocaleString("en-US")}{" "}
              {developers === 1 ? "developer" : "developers"}
            </strong>{" "}
            on MainBranch
          </p>
          <CommunitySearch search={search} />
          {search && (
            <p className="text-sm text-text-muted">
              {total} {total === 1 ? "result" : "results"} for “{search}” ·{" "}
              <Link href="/communities" className={linkClass}>
                Clear search
              </Link>
            </p>
          )}
        </div>
        <DeveloperScene className="hidden lg:block" />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[28px] text-accent-text">
            Choose your room
          </h2>
          <p className="font-mono text-xs text-text-muted">
            {total} {total === 1 ? "community" : "communities"}
          </p>
        </div>

        {items.length > 0 ? (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((community, index) => (
              <CommunityCard
                key={community.id}
                community={community}
                index={index}
              />
            ))}
          </ul>
        ) : total > 0 ? (
          <EmptyState
            title="This page is empty"
            description={`There are only ${totalPages} pages of communities.`}
            action={
              <Link href={communitiesHref(search, 1)} className={linkClass}>
                Go to the first page
              </Link>
            }
          />
        ) : search ? (
          <EmptyState
            title="No communities found"
            description={`Nothing matches “${search}”. Try a technology name like React or Python.`}
            action={
              <Link href="/communities" className={linkClass}>
                Show all communities
              </Link>
            }
          />
        ) : (
          <EmptyState
            title="No communities yet"
            description="Communities will appear here once they are added."
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          hrefForPage={(target) => communitiesHref(search, target)}
        />
      </section>
    </div>
  );
}
