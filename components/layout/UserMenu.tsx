"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  name: string;
  username?: string;
};

const itemClass =
  "rounded-control px-2 py-1.5 text-left text-sm text-text-muted hover:bg-bg hover:text-text";

export function UserMenu({ name, username }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutsideClick(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="text-sm text-text hover:text-accent-text"
      >
        {name}
      </button>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute right-0 z-20 mt-2 flex w-48 flex-col gap-0.5 rounded-container border border-border bg-surface p-2"
        >
          <Link href="/dashboard" className={itemClass}>
            Dashboard
          </Link>
          {username && (
            <Link href={`/profile/${username}`} className={itemClass}>
              Profile
            </Link>
          )}
          <Link href="/bookmarks" className={itemClass}>
            Bookmarks
          </Link>
          <Link href="/settings" className={itemClass}>
            Settings
          </Link>
          <button
            type="button"
            onClick={() => signOut({ redirectTo: "/" })}
            className={`${itemClass} border-t border-border`}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
