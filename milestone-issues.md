# GitHub issues — one per milestone

Copy each block into a new GitHub issue: the first line is the title, the rest is the body. Label them all `milestone`. Close each one from its Pull Request by writing `Closes #<number>` in the PR description.

Definition of Done for every issue: validated on the server · protected where needed · tests written and passing · loading / empty / error states · works on mobile · Vercel preview checked · I can explain every line.

---

**Milestone 0 — Walking skeleton**
- [ ] create-next-app (TypeScript, ESLint, Tailwind, App Router, no src/, alias @/*)
- [ ] `.env.example` with variable names only (+ `!.env.example` in .gitignore)
- [ ] `docs/decisions.md`
- [ ] Push to GitHub
- [ ] First deploy on Vercel

---

**Milestone 1 — Design system + app shell**
- [ ] Semantic color tokens (dark default) in Tailwind `@theme`
- [ ] Fonts: Newsreader, Inter, JetBrains Mono
- [ ] `components/ui`: Button, Input, Badge, Skeleton, EmptyState
- [ ] Layout: Navbar (server) + NavLink + UserMenu (client), Footer
- [ ] Responsive shell checked on mobile

---

**Milestone 2 — Database**
- [ ] MongoDB Atlas free cluster + database user + network access
- [ ] `lib/db.ts` connection (reused between requests)
- [ ] Models: User, Community, Membership, Post, Comment, Bookmark
- [ ] Indexes from the Data Model
- [ ] `scripts/seed.ts` with communities and sample posts
- [ ] `MONGODB_URI` added on Vercel

---

**Milestone 3 — Authentication**
- [ ] Auth.js with GitHub and Google, MongoDB adapter, JWT sessions
- [ ] `/signin` page with callbackUrl back to the previous page
- [ ] Username generated on first sign-in
- [ ] `proxy.ts` redirects for protected pages
- [ ] OAuth callback URLs for localhost and production
- [ ] Vitest and Playwright setup with temporary test databases (decision 020)
- [ ] GitHub Actions on every PR: lint, types, unit, integration, E2E, build; required on `main`
- [ ] Unit: username generation (format, length, duplicates, missing name)
- [ ] Integration: first sign-in creates a username, a taken name gets a suffix
- [ ] E2E: protected pages redirect to `/signin` and return to `callbackUrl`; external `callbackUrl` is refused
- [ ] Manual: real GitHub and Google sign-in, same email on both providers

---

**Milestone 4 — Communities**
- [ ] `/communities` list with search (Dynamic)
- [ ] `/communities/[slug]` details (ISR) + not-found
- [ ] Membership API: GET / POST / DELETE `/api/communities/[id]/membership`
- [ ] JoinLeaveButton (client island)
- [ ] Integration: membership 401 / 404 / 201 / 200 when already joined / 204
- [ ] Component: JoinLeaveButton states, including a failed request
- [ ] E2E: search, join and leave a community

---

**Milestone 5 — Posts**
- [ ] Zod post schema shared by BlogForm and the API
- [ ] POST / PATCH / DELETE `/api/posts` with 401 / 400 / 404 / 403
- [ ] `/create` and `/blogs/[slug]/edit` with one BlogForm
- [ ] `/blogs/[slug]` (ISR) with Markdown rendering, revalidate on change
- [ ] Cascade delete in a transaction
- [ ] Unit: Zod post schema, slug, reading time
- [ ] Integration: every status of POST / PATCH / DELETE, including non-member and non-owner 403
- [ ] Integration: an author id in the body is ignored; cascade delete rolls back on failure
- [ ] Security: raw HTML and `javascript:` links in Markdown do not execute
- [ ] Component: BlogForm errors
- [ ] E2E: create, edit and delete a post; the cached page updates

---

**Milestone 6 — Discovery**
- [ ] `/blogs` search, filters (topic, community, author), newest, pagination
- [ ] Filters stored in the URL
- [ ] `GET /api/posts` with query validation
- [ ] Empty state for zero results
- [ ] Unit: query validation
- [ ] Integration: search, each filter, combined filters, pagination limits
- [ ] E2E: filters survive refresh and the back button

---

**Milestone 7 — Comments + Bookmarks**
- [ ] Comment API + CommentForm + delete own comment
- [ ] Bookmark API + BookmarkButton (idempotent)
- [ ] `/bookmarks` page with pagination and empty state
- [ ] Integration: comment and bookmark statuses, ownership, double bookmark returns 200
- [ ] Component: CommentForm and BookmarkButton
- [ ] E2E: comment, bookmark, find it in `/bookmarks`

---

**Milestone 8 — Profile, Settings, Dashboard**
- [ ] `/profile/[username]` (ISR)
- [ ] `/settings` + `PATCH /api/users/me` (409 on taken username)
- [ ] `/dashboard` from the wireframe
- [ ] Integration: `PATCH /api/users/me` 400 / 401 / 409; cannot update another user
- [ ] Component: ProfileForm errors
- [ ] E2E: change username, new profile URL works

---

**Milestone 9 — States + polish**
- [ ] loading.tsx / error.tsx / not-found.tsx where needed
- [ ] Empty states on every list
- [ ] Mobile pass on every page
- [ ] Keyboard focus and contrast check
- [ ] axe on every page, plus a manual keyboard check
- [ ] E2E on desktop and mobile, Chromium, Firefox and WebKit
- [ ] E2E: empty, error and not-found states

---

**Milestone 10 — Release**
- [ ] README: product, stack, setup, env names, architecture, deployment
- [ ] Production OAuth callbacks tested
- [ ] Submission checklist from the brief
- [ ] Technical defense practice
- [ ] Lighthouse on `/`, `/blogs` and a post
- [ ] Smoke test on production after deploy (read only)
- [ ] Full authorization matrix checked against the API contract
