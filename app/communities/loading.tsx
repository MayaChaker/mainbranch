import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading communities"
      className="mx-auto max-w-4xl px-6 py-12 md:py-16"
    >
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-9 w-64" />
      <Skeleton className="mt-4 h-4 w-96 max-w-full" />
      <Skeleton className="mt-10 h-11" />
      <div className="mt-6 flex flex-col gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    </section>
  );
}
