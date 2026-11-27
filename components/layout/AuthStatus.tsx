"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Skeleton } from "@/components/ui/Skeleton";
import { UserMenu } from "./UserMenu";

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Skeleton className="h-8 w-28" />;
  }

  if (session?.user) {
    return (
      <UserMenu
        name={session.user.name ?? "Account"}
        username={session.user.username}
      />
    );
  }

  return (
    <>
      <Link href="/signin" className="text-sm text-text-muted hover:text-text">
        Sign in
      </Link>
      <Link
        href="/signin"
        className="rounded-control border-[0.5px] border-accent px-4 py-2 text-sm text-accent-text hover:bg-surface"
      >
        Join
      </Link>
    </>
  );
}
