"use client";
import { useState } from "react";
import Link from "next/link";
type UserMenuProps = {
  name: string;
  username: string;
};

export function UserMenu({ name, username }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="text-sm text-text">
        {name}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 flex flex-col gap-1 rounded-container border border-border bg-surface p-2">
          <Link
            href="/dashboard"
            className="flex flex-col text-sm text-text-muted hover:text-text"
          >
            Dashboard
          </Link>
          <Link
            href={`/profile/${username}`}
            className="flex flex-col text-sm text-text-muted hover:text-text"
          >
            Profile
          </Link>
          <Link
            href="/bookmarks"
            className="flex flex-col text-sm text-text-muted hover:text-text"
          >
            Bookmarks
          </Link>
          <Link
            href="/settings"
            className="flex flex-col text-sm text-text-muted hover:text-text"
          >
            Settings
          </Link>
          <button className="flex flex-col text-sm text-text-muted hover:text-text">
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
