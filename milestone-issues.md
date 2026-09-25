# GitHub issues — one per milestone

Copy each block into a new GitHub issue: the first line is the title, the rest is the body. Label them all `milestone`. Close each one from its Pull Request by writing `Closes #<number>` in the PR description.

Definition of Done for every issue: validated on the server · protected where needed · loading / empty / error states · works on mobile · Vercel preview checked · I can explain every line.

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

---

**Milestone 4 — Communities**
- [ ] `/communities` list with search (Dynamic)
- [ ] `/communities/[slug]` details (ISR) + not-found
- [ ] Membership API: GET / POST / DELETE `/api/communities/[id]/membership`
- [ ] JoinLeaveButton (client island)

---

**Milestone 5 — Posts**
- [ ] Zod post schema shared by BlogForm and the API
- [ ] POST / PATCH / DELETE `/api/posts` with 401 / 400 / 404 / 403
- [ ] `/create` and `/blogs/[slug]/edit` with one BlogForm
- [ ] `/blogs/[slug]` (ISR) with Markdown rendering, revalidate on change
- [ ] Cascade delete in a transaction

---

**Milestone 6 — Discovery**
- [ ] `/blogs` search, filters (topic, community, author), newest, pagination
- [ ] Filters stored in the URL
- [ ] `GET /api/posts` with query validation
- [ ] Empty state for zero results

---

**Milestone 7 — Comments + Bookmarks**
- [ ] Comment API + CommentForm + delete own comment
- [ ] Bookmark API + BookmarkButton (idempotent)
- [ ] `/bookmarks` page with pagination and empty state

---

**Milestone 8 — Profile, Settings, Dashboard**
- [ ] `/profile/[username]` (ISR)
- [ ] `/settings` + `PATCH /api/users/me` (409 on taken username)
- [ ] `/dashboard` from the wireframe

---

**Milestone 9 — States + polish**
- [ ] loading.tsx / error.tsx / not-found.tsx where needed
- [ ] Empty states on every list
- [ ] Mobile pass on every page
- [ ] Keyboard focus and contrast check

---

**Milestone 10 — Release**
- [ ] README: product, stack, setup, env names, architecture, deployment
- [ ] Production OAuth callbacks tested
- [ ] Submission checklist from the brief
- [ ] Technical defense practice
