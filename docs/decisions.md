# Decisions

Short records of the important technical decisions in MainBranch: what was decided, why, and what was rejected. Newest decisions go at the bottom. If a decision changes, add a new entry that replaces the old one instead of editing history.

---

## 001 — Rendering strategy per route

Date: 2026-09-25
Decision: Static for `/signin`; ISR for `/`, `/communities/[slug]`, `/blogs/[slug]`, `/profile/[username]`; Dynamic for `/communities`, `/blogs`, `/dashboard`, `/bookmarks`, `/settings`, `/create`, `/blogs/[slug]/edit`.
Why: the question is "who sees what". Same content for everyone → cache it (ISR, revalidated when the data changes). Content that depends on the user or on the URL query → Dynamic.
Rejected: one strategy everywhere.

## 002 — Personal parts of cached pages are client islands

Date: 2026-09-25
Decision: `BookmarkButton`, `JoinLeaveButton` and owner actions are small client components that ask the server for the user's state.
Why: the page stays ISR and fast; only the button depends on the user.
Rejected: making the whole page Dynamic because of one button.

## 003 — Membership is its own collection

Date: 2026-09-25
Decision: `Membership { userId, communityId, joinedAt }`.
Why: a community can have thousands of members. An array inside Community grows without limit (16MB document cap) and is loaded on every page view. One small document per join answers every membership question with an indexed query.
Rejected: `members[]` inside Community, `communities[]` inside User.

## 004 — Bookmark is its own collection

Date: 2026-09-25
Decision: `Bookmark { userId, postId, createdAt }`.
Why: same pattern as Membership. A user can save unlimited posts, and `/bookmarks` needs pagination sorted by date.
Rejected: `bookmarks[]` inside User.

## 005 — Embed only small, bounded lists

Date: 2026-09-25
Decision: `skills[]` inside User and `topics[]` inside Community/Post are embedded. Posts, comments, members and bookmarks are referenced.
Why: rule of thumb — if a list has a limit and is always read with its parent, embed it; if it can grow without limit, reference it.

## 006 — Topics are a fixed list in code

Date: 2026-09-25
Decision: `constants/topics.ts`, validated with `z.enum(TOPICS)`.
Why: there is no "create topic" requirement; filters need a known set of values.
Rejected: a Topic collection (would need an admin to manage it).

## 007 — Deleting a post is a hard delete with cascade

Date: 2026-09-25
Decision: deleting a post also deletes its comments and bookmarks, inside one MongoDB transaction.
Why: MongoDB has no automatic cascade; a transaction prevents half-finished deletes and orphaned bookmarks.
Rejected: soft delete (`deletedAt`) — every query would need a filter; not needed for the MVP.

## 008 — Username is editable

Date: 2026-09-25
Decision: generated on first sign-in, editable in `/settings`. Zod `^[a-z0-9-]{3,20}$`, unique, `409 Conflict` if taken. Old profile links break (like GitHub).
Why: Google sign-in gives no username, so users need to choose a better one.

## 009 — Auth.js with MongoDB adapter and JWT sessions

Date: 2026-09-25
Decision: the adapter stores `users` and `accounts`; our User model adds `username`, `headline`, `bio`, `skills` on the same collection. Sessions use JWT. Same email from GitHub and Google is not linked automatically.
Why: no database read on every request; not auto-linking accounts is the safer default.

## 010 — Where data is read and written

Date: 2026-09-25
Decision: pages read data by calling `lib/` directly from Server Components. Route Handlers are used for every mutation and for reads the browser needs.
Why: no extra HTTP hop for server rendering; one clear HTTP boundary for everything the browser can call.

## 011 — Authorization lives next to the data

Date: 2026-09-25
Decision: three layers — `proxy.ts` redirects (UX), protected pages check `auth()` (UX), Route Handlers check every request (security). Order: session 401 → input 400 → resource 404 → ownership 403. User and author ids always come from the session, never from the request body.
Why: anyone can call the API directly; hidden buttons are not security.

## 012 — `/api/users/me` instead of `/api/users/[id]`

Date: 2026-09-25
Decision: profile updates go to `/api/users/me`; the server takes the user from the session.
Why: there is no id in the URL to change, so nobody can edit another profile.

## 013 — Join and bookmark are idempotent

Date: 2026-09-25
Decision: joining twice or saving twice returns `200`, not an error.
Why: a double click on a slow network should not show an error for something that succeeded.

## 014 — MVP scope trims

Date: 2026-09-25
Decision: "Trending topics" shows the fixed topic list; "Developers to discover" and "Related posts" are after the MVP.
Why: the brief says not to add features only to make the project larger. Trending is listed as a bonus.

## 015 — Blog content is Markdown without raw HTML

Date: 2026-09-25
Decision: a plain textarea; content is stored as Markdown and rendered with formatting. Raw HTML is not rendered.
Why: developer posts need code blocks; blocking raw HTML prevents XSS. A rich editor is a bonus.

## 016 — Repo root is this folder directly, no nested subfolder

Date: 2026-09-25
Decision: run `create-next-app` directly inside `d:\2026\MainBranch` instead of creating a nested `mainbranch/` subfolder.
Why: the GitHub repo is meant to map 1:1 to this folder; a nested subfolder would just duplicate the name for no benefit.
Rejected: `npx create-next-app@latest mainbranch` (creates `MainBranch\mainbranch\...`).

## 017 — MobileMenu is a client island inside the server Navbar

Date: 2026-09-27
Decision: below `md` the Navbar hides its links and auth buttons and renders `<MobileMenu />`, a small `"use client"` component that toggles the same links with `useState`. It closes when any link inside it is clicked.
Why: the open/closed state needs the browser, but the rest of the Navbar does not; keeping only the toggle on the client keeps the Navbar a Server Component (see §9 of the plan). Adds MobileMenu to the list of client components.
Rejected: making the whole Navbar `"use client"`; a CSS-only toggle (harder to make accessible and to close on navigation).

## 018 — Atlas network access is open, protected by credentials

Date: 2026-09-30
Decision: the Atlas IP Access List allows `0.0.0.0/0`. The app connects as `mainbranch-app`, a database user with `readWrite` on the `mainbranch` database only, using a long autogenerated password stored in `.env.local` locally and in Vercel environment variables in production.
Why: Vercel serverless functions have no fixed outbound IPs on the free plan, and the local ISP rotates the public IP on every request, so an IP allowlist cannot work. Security relies on the credentials, TLS, and least privilege instead.
Rejected: a single IP or `213.204.67.0/24` range (breaks on Vercel and when the ISP changes range); static egress IPs or private networking (paid plans).
