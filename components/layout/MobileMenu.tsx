"use client";
import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { NavLink } from "./NavLink";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const username = session?.user?.username;

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
        aria-expanded={open}
        className="text-text"
      >
        ☰
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-x-0 top-full z-10 flex flex-col gap-4 border-b border-border bg-bg p-6"
        >
          <NavLink href="/">Explore</NavLink>
          <NavLink href="/communities">Communities</NavLink>
          <NavLink href="/blogs">Blogs</NavLink>

          {session?.user ? (
            <>
              <hr className="border-border" />
              <NavLink href="/dashboard">Dashboard</NavLink>
              {username && (
                <NavLink href={`/profile/${username}`}>Profile</NavLink>
              )}
              <NavLink href="/bookmarks">Bookmarks</NavLink>
              <NavLink href="/settings">Settings</NavLink>
              <button
                type="button"
                onClick={() => signOut({ redirectTo: "/" })}
                className="text-left text-sm text-text-muted hover:text-text"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signin"
                className="text-sm text-text-muted hover:text-text"
              >
                Sign in
              </Link>
              <Link
                href="/signin"
                className="rounded-control bg-accent px-4 py-2.5 text-center text-sm font-medium text-on-accent hover:bg-accent-hover"
              >
                Join free
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
