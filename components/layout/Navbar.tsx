import Link from "next/link";
import { NavLink } from "./NavLink";
import { MobileMenu } from "./MobileMenu";
import { AuthStatus } from "./AuthStatus";

export function Navbar() {
  return (
    <header className="relative border-b border-border">
      <nav className="flex items-center justify-between px-6 py-4 md:px-16">
        <Link href="/" className="font-display text-2xl text-accent-text">
          Main<em className="text-brass">Branch</em>
        </Link>
        <div className="hidden items-center gap-6 md:flex">
          <NavLink href="/">Explore</NavLink>
          <NavLink href="/communities">Communities</NavLink>
          <NavLink href="/blogs">Blogs</NavLink>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <AuthStatus />
        </div>
        <MobileMenu />
      </nav>
    </header>
  );
}
