import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";

export default function CommunityNotFound() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-16">
      <EmptyState
        title="This community does not exist"
        description="The link may be old, or the name may be misspelled."
        action={
          <Link
            href="/communities"
            className="text-sm font-medium text-accent-text underline-offset-4 hover:underline"
          >
            See all communities
          </Link>
        }
      />
    </div>
  );
}
