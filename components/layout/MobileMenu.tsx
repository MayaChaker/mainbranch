"use client";
import { useState } from "react";
import Link from "next/link";
import { NavLink } from "./NavLink";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Menu"
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
          <Link
            href="/signin"
            className="text-sm text-text-muted hover:text-text"
          >
            Sign in
          </Link>
          <Link
            href="/signin"
            className="rounded-control border-[0.5px] border-accent px-4 py-2 text-center text-sm text-accent-text hover:bg-surface"
          >
            Join
          </Link>
        </div>
      )}
    </div>
  );
}
