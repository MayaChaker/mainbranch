import { MAX_SEARCH_LENGTH } from "@/schemas/communities";

export function CommunitySearch({ search }: { search?: string }) {
  return (
    <form
      action="/communities"
      role="search"
      className="flex max-w-xl items-center gap-3 rounded-control border border-border bg-surface px-4 py-3 transition-colors focus-within:border-accent"
    >
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="shrink-0 text-text-muted"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <label htmlFor="community-search" className="sr-only">
        Search communities
      </label>
      <input
        id="community-search"
        name="search"
        type="search"
        defaultValue={search}
        maxLength={MAX_SEARCH_LENGTH}
        placeholder="Search React, Python, DevOps…"
        className="w-full bg-transparent text-[15px] text-text placeholder:text-text-muted focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded-control bg-accent px-3.5 py-1.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-hover"
      >
        Search
      </button>
    </form>
  );
}
