import Link from "next/link";
import type { CommunityListItem } from "@/lib/communities";

function memberLabel(count: number) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? "member" : "members"}`;
}

type CommunityCardProps = {
  community: CommunityListItem;
  index: number;
};

export function CommunityCard({ community, index }: CommunityCardProps) {
  return (
    <li
      className="anim-fade-up"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <Link
        href={`/communities/${community.slug}`}
        className="group flex h-full flex-col gap-3.5 rounded-container border border-border bg-surface p-6 transition duration-300 hover:-translate-y-1.5 hover:border-brass hover:shadow-[0_18px_40px_rgba(30,58,43,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <h2 className="font-display text-2xl text-accent-text">
          {community.name}
        </h2>
        <p className="text-sm leading-relaxed text-text-muted">
          {community.description}
        </p>
        {community.topics.length > 0 && (
          <p className="font-mono text-[11px] text-brass-text">
            {community.topics.join(" · ")}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between border-t border-dashed border-border pt-4">
          <span className="text-xs text-text-muted">
            {memberLabel(community.memberCount)}
          </span>
          <span className="rounded-control bg-accent px-3.5 py-2 text-[13px] font-medium text-on-accent transition duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
            Open →
          </span>
        </div>
      </Link>
    </li>
  );
}
