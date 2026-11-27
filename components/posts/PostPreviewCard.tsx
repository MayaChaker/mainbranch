import Link from "next/link";
import type { PostPreview } from "@/lib/posts";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type PostPreviewCardProps = {
  post: PostPreview;
  featured?: boolean;
};

export function PostPreviewCard({ post, featured = false }: PostPreviewCardProps) {
  return (
    <article
      className={`flex h-full flex-col gap-3 rounded-container border border-border bg-surface p-6 ${
        featured ? "md:p-8" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-semibold text-on-accent"
        >
          {initials(post.authorName)}
        </span>
        <p className="text-xs text-text-muted">
          <span className="font-semibold text-text">{post.authorName}</span>
          {" in "}
          <Link
            href={`/communities/${post.community.slug}`}
            className="text-accent-text underline-offset-4 hover:underline"
          >
            {post.community.name}
          </Link>
          {" · "}
          <time dateTime={post.createdAt}>
            {dateFormat.format(new Date(post.createdAt))}
          </time>
        </p>
      </div>
      <h3
        className={`font-display leading-snug text-accent-text ${
          featured ? "text-[28px] md:text-[32px]" : "text-xl"
        }`}
      >
        {post.title}
      </h3>
      <p className="text-sm leading-relaxed text-text-muted">{post.excerpt}</p>
    </article>
  );
}
