import Link from "next/link";

type PaginationProps = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

const linkClass =
  "font-mono text-xs uppercase tracking-widest text-text-muted transition-colors hover:text-accent-text";

export function Pagination({ page, totalPages, hrefForPage }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-between"
    >
      {page > 1 ? (
        <Link href={hrefForPage(page - 1)} className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="font-mono text-xs text-text-muted">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link href={hrefForPage(page + 1)} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
