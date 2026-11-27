"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type JoinLeaveButtonProps = {
  communityId: string;
  communityName: string;
  slug: string;
  memberCount: number;
};

type MembershipState = "unknown" | "member" | "guest";

function memberLabel(count: number) {
  return `${count.toLocaleString("en-US")} ${count === 1 ? "member" : "members"}`;
}

const baseClass =
  "inline-flex items-center justify-center gap-2 rounded-control px-5 py-3 text-[15px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-wait disabled:opacity-70";
const joinClass = `${baseClass} bg-accent text-on-accent hover:bg-accent-hover`;
const leaveClass = `${baseClass} border border-border bg-bg text-text hover:border-error-bg hover:text-error-text`;

export function JoinLeaveButton({
  communityId,
  communityName,
  slug,
  memberCount,
}: JoinLeaveButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const [membership, setMembership] = useState<MembershipState>("unknown");
  const [count, setCount] = useState(memberCount);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const url = `/api/communities/${communityId}/membership`;

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    fetch(url)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data: { isMember: boolean }) => {
        if (!cancelled) setMembership(data.isMember ? "member" : "guest");
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your membership.");
      });
    return () => {
      cancelled = true;
    };
  }, [status, url]);

  async function toggle() {
    const joining = membership !== "member";
    setPending(true);
    setError(null);
    try {
      const response = await fetch(url, { method: joining ? "POST" : "DELETE" });
      if (!response.ok) throw new Error(String(response.status));
      // 201 = a new membership; 200 = it already existed, so the count stays.
      if (joining && response.status === 201) setCount((value) => value + 1);
      if (!joining) setCount((value) => Math.max(0, value - 1));
      setMembership(joining ? "member" : "guest");
      router.refresh();
    } catch {
      setError(joining ? "Could not join. Please try again." : "Could not leave. Please try again.");
    } finally {
      setPending(false);
    }
  }

  let action: ReactNode;
  if (status === "unauthenticated") {
    action = (
      <Link
        href={`/signin?callbackUrl=${encodeURIComponent(`/communities/${slug}`)}`}
        className={joinClass}
      >
        Sign in to join
      </Link>
    );
  } else if (status === "loading" || (membership === "unknown" && !error)) {
    action = (
      <span
        aria-hidden="true"
        className="inline-block h-[48px] w-[150px] animate-pulse rounded-control bg-surface-strong"
      />
    );
  } else {
    const isMemberNow = membership === "member";
    action = (
      <div className="flex flex-col items-start gap-2">
        <button
          type="button"
          onClick={toggle}
          disabled={pending}
          aria-busy={pending}
          className={isMemberNow ? leaveClass : joinClass}
        >
          {pending && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            />
          )}
          {isMemberNow ? `Leave ${communityName}` : `Join ${communityName}`}
        </button>
        {isMemberNow && !pending && (
          <p className="text-xs text-success-text">You are a member.</p>
        )}
        {error && (
          <p role="alert" className="text-xs text-error-text">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-text-muted" aria-live="polite">
        <strong className="font-semibold text-text">{memberLabel(count)}</strong>
      </p>
      <div className="w-full sm:ml-auto sm:w-auto">{action}</div>
    </>
  );
}
