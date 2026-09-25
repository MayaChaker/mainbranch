# MainBranch — Project Planning

Source: Notion page "MainBranch — Project Planning" (https://app.notion.com/p/83927c2508bb8378a09a81ca3aca9a34), exported 2026-09-25. Steps 1-9 of the planning process. This is the detailed reasoning behind the project decisions; `docs/decisions.md` is the running log of individual technical decisions.

---

**Status: Planning complete (Steps 1-9). Now building: Milestone 0 — walking skeleton.**

---

# Step 1 — Requirements Analysis

## 1. Product Vision

DevCommunity is a platform where developers discover communities around the technologies they use, publish technical posts into those communities, and build a public profile from what they write and join.

Scope rule: finish the required flow end-to-end (deployed, with auth and ownership) before starting any bonus feature.

## 2. User Types

**Guest**
- Explore communities and view community details
- Read blogs
- Search blogs and communities
- View developer profiles

**Authenticated Developer**
- Everything a guest can do
- Join / leave communities
- Create blogs, edit / delete own blogs
- Comment on blogs, delete own comments
- Bookmark blogs
- Edit own profile

**Admin:** not part of the MVP. No admin role, so only owners can edit or delete their content.

## 3. Functional Requirements

**Authentication**
- Sign in with GitHub
- Sign in with Google
- Auth.js creates and maintains the user session
- Protected pages: /dashboard, /settings, /bookmarks, /create, /blogs/[slug]/edit
- Unauthenticated users are redirected to /signin, then back to the page they came from

**Communities**
- Browse communities
- View community details: info, topics / hashtags, members count, posts published in it
- Authenticated users can join / leave a community

**Blogs**
- Browse blogs and read a blog detail page
- Home shows latest blogs (trending only if time allows, it is a bonus)
- Authenticated users can create a blog and publish it into a community
- Owners can edit / delete their own blogs

**Profiles**
- Public profile shows bio, skills, joined communities, published posts
- Owners can edit their own profile from /settings

**Comments**
- Anyone can read comments on a blog
- Authenticated users can add comments
- Comment owners can delete their own comments

**Bookmarks**
- Authenticated users can bookmark / remove bookmark on a blog
- Authenticated users can view their saved posts in /bookmarks
- A bookmark always belongs to the current session user (never a userId sent from the browser)

**Search & Discovery**
- Search communities (by name)
- Search blogs (by title)
- Filter blogs by topic, community, author
- Sort blogs by newest
- Paginate blog results
- Search, filters and pagination run as database queries on the server, never by loading all data into the browser

## 4. Scope

**Required (MVP)**
- Product: communities + topics, profiles, blog CRUD, comments, bookmarks, search / filter / pagination
- Auth: GitHub + Google OAuth with Auth.js, protected pages, ownership rules
- Backend: MongoDB Atlas + Mongoose, Route Handlers, Zod validation on client and server
- Frontend: at least two rendering strategies, loading / empty / error / not-found states, responsive Tailwind UI
- Delivery: Vercel deployment, Git workflow with feature branches and PRs, README

**Bonus (only after MVP works in production)**
- Reactions / likes, notifications, follow developers, moderation tools, admin dashboard
- Rich-text / markdown editor, trending algorithm, image upload, advanced search
- Theme preference, PPR, tests for critical business rules

## 5. User Flows

**Flow 1 — Guest Discovery**
Guest → Explore communities → Open community → Open blog → Clicks Join → Redirected to /signin → Signs in → Back on the same community → Join
- Decision: after sign-in the user returns to the page they were on (Auth.js callbackUrl), not to /dashboard.

**Flow 2 — Create & Publish Blog**
Developer → Sign in → Complete profile → Join a community → Create blog → Choose community → Publish → Redirected to the new blog page
- Decision: completing the profile is optional. A username is generated on first sign-in, so every post always has an author. The dashboard shows "Complete your profile" while the bio is empty.

**Flow 3 — Search & Bookmark**
Developer → Search for a topic → Filter results → Open blog → Bookmark post
- Decision: search and filters live in the URL (/blogs?search=next&topic=react&page=2), so results can be shared and the back button keeps the filters.

**Flow 4 — Unauthorized Edit**
Developer A → Sends PATCH / DELETE on Developer B's blog (even without the UI) → Server checks session + ownership → 403 Forbidden
- If the user is not signed in at all → 401 Unauthorized.

---

# Step 2 — Sitemap & Routes

## Routes & Rendering

| Page | Route | Access | Rendering | Why |
| --- | --- | --- | --- | --- |
| Home / Explore | / | Public | ISR (revalidate) | Same content for every visitor; a short delay before new posts appear is acceptable |
| Communities | /communities | Public | Dynamic | The list depends on the search query in the URL, so every request can give a different result |
| Community Details | /communities/[slug] | Public (join needs auth) | ISR + revalidate on new post | Same page for every visitor, so it is cached and revalidated when a new post is published. Join / Leave depends on the user, so it is a small client component that asks the server for the membership status |
| Blogs | /blogs | Public | Dynamic | Every search / filter combination gives a different result, so there is nothing useful to cache for everyone |
| Blog Details | /blogs/[slug] | Public (comment / bookmark need auth) | ISR + revalidate on edit / delete / new comment | Read a lot, rarely changes. The bookmark button depends on the user, so it is a small client component and the page stays ISR |
| Edit Blog | /blogs/[slug]/edit | Owner only | Dynamic | Only the owner can see it, so the server checks the session and ownership on every request (and again in PATCH /api/posts/[id]) |
| Developer Profile | /profile/[username] | Public | ISR | Same page for every visitor, changes only when the owner edits it, so it is cached and revalidated on save from /settings |
| Sign in | /signin | Public | Static | No data, same page for everyone, only changes with a new deploy |
| Dashboard | /dashboard | Protected | Dynamic | Content depends entirely on the signed-in user |
| Bookmarks | /bookmarks | Protected | Dynamic | Every user sees a different list (their own bookmarks), so it cannot be cached for everyone |
| Settings | /settings | Protected | Dynamic | Shows the signed-in user's own profile data, so it depends on the session |
| Create Blog | /create | Protected | Dynamic | Needs the session to know the author, and loads the communities list for the form |

## Sitemap Hierarchy

```
Home / Explore
├── Communities
│   └── Community Details
│       └── Blog Details
├── Blogs
│   └── Blog Details
│       └── Edit Blog (owner only)
├── Developer Profile
├── Sign in
├── Dashboard
├── Bookmarks
├── Settings
└── Create Blog
```

## Navigation

- Public: Home, Communities, Blogs, Sign in
- Authenticated: Home, Communities, Blogs, Dashboard, Bookmarks, Create Blog, Settings, Profile, Sign out

## Page Responsibilities

| Page | Must show | Main actions | Empty / not-found state |
| --- | --- | --- | --- |
| Home / Explore | Latest blogs, featured communities, topics | Open community, open blog, search | No posts yet |
| Communities | Community list, search | Search, open community | No communities match the search |
| Community Details | Info, topics, members count, posts | Join / leave, open post | Unknown slug → 404; community has no posts yet |
| Blogs | Blog list, search, filters, pagination | Search, filter, open blog | Zero results for the filters |
| Blog Details | Content, author, community, topics, comments | Comment, bookmark, edit / delete (owner) | Unknown or deleted slug → 404; no comments yet |
| Edit Blog | Same form as Create, pre-filled | Save changes | Not owner → 403 |
| Developer Profile | Bio, skills, joined communities, posts | Open their posts / communities | Unknown username → 404; no posts yet |
| Dashboard | My posts, my communities, link to create | Open own content, go to create | New user with no posts / communities |
| Bookmarks | Saved posts of current user | Open post, remove bookmark | No bookmarks yet |
| Settings | Own profile fields | Edit bio / skills | — |
| Create Blog | Title, content, community, topics | Publish | — |

## Feature → Route Check

| Feature | Where | Rule |
| --- | --- | --- |
| Browse / view communities | /communities, /communities/[slug] | Public |
| Join / leave community | /communities/[slug] | Auth |
| Browse / search / filter blogs | /blogs | Public, server query |
| Read blog | /blogs/[slug] | Public |
| Create blog | /create | Auth |
| Edit blog | /blogs/[slug]/edit | Owner |
| Delete blog | /blogs/[slug] | Owner |
| Comment | /blogs/[slug] | Auth |
| Delete comment | /blogs/[slug] | Comment owner |
| Bookmark | /blogs/[slug] | Auth |
| View bookmarks | /bookmarks | Auth |
| View profile | /profile/[username] | Public |
| Edit own profile | /settings | Auth |
| Personal overview | /dashboard | Auth |

## Decisions Check

هل كل required feature إلها page أو مكان واضح؟
- Decision: yes, see Feature → Route Check.
- Decision: yes. Every protected page and action is listed in Step 7 with where its check happens.

هل في أي feature ضفناها وهي مش required؟
- Decision: yes, three items in the wireframes were not required. "Trending topics" on Home becomes the fixed topic list from constants/topics.ts (the trending algorithm is a bonus). "Developers to discover" (Home) and "Related posts" (Blog Details) are after the MVP: the space stays in the design but they are not built now. Reason: the brief says not to add features only to make the project larger.

هل في أي page عملناها بلا requirement واضح؟
- Decision: no. The two pages added beyond the brief's table, /signin and /blogs/[slug]/edit, exist to complete required flows (sign-in and edit own blog).

هل edit/delete blog وين رح ينعمل بالضبط؟
- Decision: edit in /blogs/[slug]/edit, delete as a button on /blogs/[slug] visible to the owner only. The server checks ownership in both cases.

هل comments رح تكون بنفس blog details page؟
- Decision: yes, under the blog content on /blogs/[slug].

هل search للcommunities والblogs بنفس المكان أو كل وحدة بصفحتها؟
- Decision: separate pages. Communities are searched on /communities?search= and blogs on /blogs?search=. The search box on Home sends the user to /blogs?search=.

هل dashboard شو رح يحتوي تحديداً بدون ما يصير overloaded؟
- Decision: follow the Dashboard wireframe (3.4.7): overview counts, recent posts, joined communities, recent bookmarks, quick actions. No fake analytics.

هل في sign-in page مستقلة، أو Auth.js flow رح يكون modal/button/redirect؟
- Decision: a /signin page with GitHub + Google buttons, using callbackUrl to return the user to the page they came from.

هل create/edit blog نفس form component أو صفحات منفصلة؟
- Decision: two routes, one shared BlogForm component, so validation lives in one place.

Can a user publish into any community, or only the ones they joined?
- Decision: only communities the user is a member of. The /create dropdown lists joined communities only, and POST /api/posts checks membership on the server (403 if not a member). A user with no communities sees "Join a community first" instead of the form.

هل profile editing كله ضمن /settings؟
- Decision: yes, see Settings wireframe (3.4.9).

هل joined communities بتنشاف على profile ولا dashboard كمان؟
- Decision: both (Profile wireframe 3.4.6 and Dashboard wireframe 3.4.7), from the same Membership query.

## Planning decisions

- Sign-in UX: page or modal? → see Decisions Check (/signin page)
- Edit Blog: separate route or reuse create form? → see Decisions Check (/blogs/[slug]/edit + shared BlogForm)
- Dashboard content: exact widgets/sections? → Dashboard wireframe (3.4.7)
- Community membership display: count only or member list? → count + small member preview (Community Details wireframe)
- Blog editor: plain textarea first, rich text later? → plain textarea; content is stored as Markdown and rendered with formatting (developer posts need code blocks). Raw HTML inside Markdown is not allowed, which prevents XSS. A toolbar and live preview are bonus.
- Topic structure: static list or collection? → static list in constants/topics.ts (see Community in the Data Model)

---

# Step 3 — UI/UX Planning

## 3.1 Brand Foundation

**Brand Name:** MainBranch

**Brand Meaning:** MainBranch represents the central place where developers connect, learn, share technical knowledge, and grow together. "Branch" has a double meaning: a Git branch and an olive branch, a gesture of welcome. The olive color and the branch logo carry the same idea, and the tagline "Where developers branch out." says it in words.

**Logo Direction:** Minimal Git branch / connected-node symbol. The logo should feel technical, simple, recognizable, and developer-focused.

**Brand Personality**
- Professional
- Modern
- Technical
- Community-focused
- Clean
- Mature

**Color Direction:** Olive green, charcoal / dark neutral, warm white. Full palette in 3.6.1.

## 3.2 UI References

No single reference was adopted.
- I reviewed developer/blog/community interfaces.
- I did not find one visual direction that matches the product and brand.
- References will only be used for isolated UX patterns when needed.

## 3.3 Concept Exploration

Several generic design directions were explored and rejected because they felt too template-like and did not match the brand.

Decision: the UI direction is defined manually through wireframes, layout decisions, typography, spacing, and selected real-world UX patterns.

## 3.4 Low-Fidelity Wireframes

### 3.4.1 Home / Explore

```
NAVBAR
MainBranch | Explore | Communities | Blogs | Search | Sign In / User

MAIN HERO
Small label: Developer community
Learn from developers.
Share what you know.
Find your community.
Short supporting sentence
[ Search posts, communities, topics... ]
optional subtle visual / graphic

FEATURED COMMUNITIES
React   Next.js   TypeScript   Node.js
Short description / Topics / Members

LATEST ARTICLES
Featured Article: large title, short excerpt, Author • Community • Date
Article title — Author
Article title — Author
Article title — Author

TRENDING TOPICS
React  Next.js  TypeScript  APIs  MongoDB  Node.js

DEVELOPERS TO DISCOVER
Avatar + Name + Role + Skills  (x3)

FOOTER
```

### 3.4.2 Communities

```
NAVBAR

PAGE HEADER
Communities
Discover communities built around technologies, tools, and topics.

SEARCH + FILTERS
[ Search communities... ]
Filters: Topic · Most active / newest if needed · Joined / All (authenticated users)

COMMUNITY LIST / GRID
Community item: name, short description, main topics, member count,
View Community, Join button if authenticated
Community item
Community item

PAGINATION
FOOTER
```

### 3.4.3 Community Details

```
NAVBAR

COMMUNITY HEADER
Community Name
Short description
#React  #JavaScript  #Frontend
12.4K members
[ Join Community ]

COMMUNITY CONTENT — Tabs / Sections: Posts · Topics · Members

POSTS SECTION
Latest posts from this community
Featured / latest post: title, author, short excerpt, date, topics
Post row
Post row
Post row

TOPICS SECTION
React  JavaScript  Frontend  Hooks  Performance

MEMBERS SECTION
Small member preview: Avatar + Name + Role
[ View more members ]

FOOTER
```

### 3.4.4 Blogs

```
NAVBAR

PAGE HEADER
Blogs
Discover technical articles written by developers.

SEARCH
[ Search articles... ]

FILTERS
Topic · Community · Author · Newest

CONTENT AREA
Featured / highlighted article: title, excerpt, author, community, date, topics
Latest Articles
Article row: title, excerpt, author, community, topics, date
Article row
Article row

PAGINATION
Previous  1  2  3  Next

FOOTER
```

### 3.4.5 Blog Details

```
NAVBAR

ARTICLE HEADER
Community / Topic
Article Title
Short subtitle or summary
Author avatar + name · Publish date · Estimated reading time
Topics / Tags

ARTICLE BODY
Main article content: headings, paragraphs, code blocks, lists
(images only if later supported)

ARTICLE ACTIONS
[ Bookmark ]
If current user owns the post: [ Edit ] [ Delete ]

AUTHOR SECTION
Avatar · Developer name · Short bio · Skills / profile link

COMMENTS
Comment item: avatar, name, date, comment text
Comment item
[ Add a comment... ]  ← authenticated user

RELATED POSTS (optional)
Related article
Related article

FOOTER
```

### 3.4.6 Developer Profile

```
NAVBAR

PROFILE HEADER
Avatar
Developer Name
Username
Short Role / Headline (e.g. Full-Stack Developer)
Short Bio
Skills: #React  #Next.js  #TypeScript  #Node.js
Joined Communities count · Published Posts count
If this is the current user: [ Edit Profile ]

SECTION 1 — Published Posts
Post row: title, excerpt, community, date, topics
Post row
Post row

SECTION 2 — Joined Communities
Community item: name, topics, member count
Community item
Community item

OPTIONAL PROFILE DETAILS
GitHub / portfolio links only if they add real value
Joined date if useful

FOOTER
```

### 3.4.7 Dashboard

```
NAVBAR (User Menu)

DASHBOARD HEADER
Welcome back, Maya
Your communities, posts, and saved content in one place.
[ Create New Blog ]

QUICK OVERVIEW
Joined Communities · Published Posts · Bookmarks
(keep simple and useful, no fake analytics)

YOUR RECENT POSTS
Post row: title, status / published, community, date, [ Edit ]
Post row
Post row

JOINED COMMUNITIES
Community item: name, topics, member count
Community item
[ View All Communities ]

RECENT BOOKMARKS
Saved article row (x3)
[ View All Bookmarks ]

QUICK ACTIONS
Create Blog · Edit Profile · View Bookmarks · Browse Communities

FOOTER
```

### 3.4.8 Bookmarks

```
NAVBAR (User Menu)

PAGE HEADER
Bookmarks
Posts you saved to read later.

SEARCH / OPTIONAL FILTERS
[ Search saved posts... ]
Optional: Topic · Community · Newest

SAVED POSTS LIST
Saved Post: title, excerpt, author, community, topics, saved date, [ Remove Bookmark ]
Saved Post
Saved Post

EMPTY STATE
You haven't saved any posts yet.
Explore technical content and save posts you want to revisit.
[ Explore Blogs ]

PAGINATION — only if the saved list becomes long
FOOTER
```

### 3.4.9 Settings

```
NAVBAR (User Menu)

PAGE HEADER
Settings
Manage your profile and account preferences.

PROFILE INFORMATION
Profile Photo / Avatar
Display Name [ Input ]
Username [ Input ]
Bio [ Textarea ]
Skills [ Add / Remove Skills ]
[ Save Changes ]

PREFERENCES
Basic preferences only if useful

ACCOUNT SECTION
Connected sign-in provider: GitHub / Google
Sign out action

FORM STATES
Default · Saving · Success · Validation error · Server error

FOOTER
```

### 3.4.10 Create Blog

```
NAVBAR (User Menu)

PAGE HEADER
Create a Blog
Share technical knowledge with the community.

BLOG FORM
Title [ Input ]
Short Summary / Excerpt [ Textarea ]
Community [ Select Community ]
Topics / Tags [ Add Topics ]
Main Content [ Large Editor Area ]

FORM ACTIONS
[ Preview ]  [ Publish ]
Optional later: [ Save Draft ]

FORM STATES
Empty/default · Validation error · Publishing · Publish success · Server error

VALIDATION EXAMPLES
Title is required
Content is required
Community must be selected
Topics must be valid

FOOTER
```

### 3.4.11 Wireframe Review Checklist

- [ ]  Home / Explore has a clear purpose
- [ ]  Communities page supports discovery + search/filter
- [ ]  Community Details shows community info, topics, members, posts, join/leave
- [ ]  Blogs page supports search, filters, and pagination
- [ ]  Blog Details is optimized for reading
- [ ]  Blog Details includes bookmark + comments
- [ ]  Blog owner has Edit/Delete actions
- [ ]  Developer Profile shows bio, skills, joined communities, and published posts
- [ ]  Dashboard is personalized and not overloaded with fake analytics
- [ ]  Bookmarks page shows saved posts + empty state
- [ ]  Settings contains profile editing and account preferences
- [ ]  Create Blog form contains title, community, topics, content, and publish action
- [ ]  Public pages are clearly separated from protected pages
- [ ]  Protected actions require authentication
- [ ]  Edit/Delete actions respect ownership
- [ ]  Search/filter controls are placed where users expect them
- [ ]  No page contains unnecessary features
- [ ]  No important feature exists without a page or interaction
- [ ]  Repeated content uses the same pattern across pages
- [ ]  Important empty/loading/error states are planned
- [ ]  Mobile behavior will be considered later

## 3.5 Component Inventory

**Global Components**
- Navbar, Footer, SearchBar
- Button, Input, Textarea, Select, Dropdown
- Avatar, Badge / TopicTag, Pagination
- EmptyState, LoadingSkeleton, ErrorMessage

**Community Components**
- CommunityCard — used in Home, Communities, Developer Profile, Dashboard
- CommunityHeader
- JoinLeaveButton
- CommunityTopicList
- CommunityMemberPreview

**Blog Components**
- BlogCard — used in Home, Blogs, Bookmarks, Developer Profile, Community Details
- BlogListItem, FeaturedBlog, BlogMeta, BlogTags
- BookmarkButton
- CommentItem, CommentForm
- ArticleContent

**Profile Components**
- ProfileHeader, SkillTag, DeveloperCard, DeveloperStats

**Dashboard Components**
- DashboardSummaryCard, RecentPostItem, QuickAction

**Form Components**
- FormField, ValidationMessage, PublishButton, SaveButton

## 3.6 Design System

### 3.6.1 Foundations

**Brand colors**

| Token | Hex | Use for |
| --- | --- | --- |
| Primary Olive | #66734B | Primary buttons, active navigation, important links/actions, selected states |
| Dark Olive | #354A2F | Hover states, strong olive accents |
| Soft Olive | #A3B68A | Tags, selected filters, subtle highlights |
| Main Background | #11140F | Page background |
| Surface / Cards | #191D17 | Cards, inputs |
| Primary Text | #F6F7F2 | Main text |
| Secondary Text | #AEB5A8 | Metadata, placeholders |
| Border | #2B3127 | Borders, dividers |
| White | #FFFFFF | Text on primary buttons |

**Typography**
- Primary font: Inter — navigation, headings, body text, buttons, forms
- Technical / code font: JetBrains Mono — only for code blocks, technical metadata, small code-related labels

| Style | Size | Weight |
| --- | --- | --- |
| Display | 48–56px | Bold / Semibold |
| H1 | 36–40px | Semibold |
| H2 | 28–32px | Semibold |
| H3 | 22–24px | Semibold |
| Body Large | 18px | Regular |
| Body | 16px | Regular |
| Small | 14px | Regular |
| Metadata / Caption | 12–13px | Regular |

**Spacing scale:** 4px (tiny) · 8px (small) · 12px · 16px (normal) · 24px (component) · 32px (section) · 48px · 64px (large section)

**Border radius:** Small 6px · Medium 10px · Large 14px · Pills 999px (only tags/badges where needed)

### 3.6.2 Buttons & Interactive States

**Primary button** — Publish Blog, Join Community, Save Changes, main call-to-action
- Background #66734B, text #FFFFFF, no border, radius 10px, font weight 600
- Hover: #354A2F · Focus: visible olive focus ring · Disabled: lower opacity, no hover · Loading: spinner, keep button width stable

**Secondary button** — Preview, View Community, Cancel, secondary actions
- Background transparent or #191D17, text #F6F7F2, border #2B3127, radius 10px
- Hover: slightly lighter surface

**Ghost button** — navbar actions, small utility actions, less important controls
- Background transparent, text #AEB5A8
- Hover: subtle dark surface, text #F6F7F2

**Destructive button** — Delete Post, remove content permanently
- Muted red, not olive · Hover: darker red

**Interactive states:** Default (normal) · Hover (subtle feedback only) · Active (slightly darker / pressed) · Focus (visible ring for keyboard users) · Disabled (reduced opacity, no interaction) · Loading (spinner or progress) · Selected (soft olive highlight) · Error (clear red text/border)

### 3.6.3 Cards, Inputs & Form States

**Cards**
- Default: background #191D17, border #2B3127, radius 10px, shadow none or very subtle, padding 16–24px
- Use for: CommunityCard, DeveloperCard, Dashboard summary cards
- Hover: slight border contrast, very subtle surface lift, no heavy animation
- Rule: not every section should be a card. Use cards only when content needs a clear container.

**Blog content style**
- Blog lists should not always use boxed cards. Use editorial rows, clear title hierarchy, metadata under title, subtle dividers.
- Reason: keeps reading/discovery pages cleaner and less dashboard-like.

**Inputs**
- Default: background #191D17, text #F6F7F2, border #2B3127, radius 10px · Placeholder #AEB5A8
- Focus: olive border / focus ring · Disabled: reduced opacity, muted background · Error: muted red border, error message below field

**Textarea / Editor** — same visual language as inputs. Used for bio, blog summary, blog content, comments. Large editor areas need comfortable padding, clear focus state, high text contrast.

**Select / Filters**
- Default: dark surface, subtle border, clear label
- Selected: soft olive background or olive border · Active filter: use #A3B68A or #66734B carefully
- Avoid too many pill-shaped filters

**Form states**
- Default — ready for input
- Focus — field clearly highlighted
- Validation error — red border, short message below field, keep user input
- Submitting — disable submit button, show loading state
- Success — clear confirmation message, do not rely on color only
- Server error — explain failure clearly, keep entered data when possible

**Form UX rules**
- Labels should always be visible
- Errors should appear next to the related field
- Do not clear user input after validation failure
- Primary action should be obvious
- Do not place many competing actions in one form

### 3.6.4 Navigation, Tags & Feedback States

**Navigation**
- Main navbar: MainBranch logo · Explore · Communities · Blogs · Search · Sign In / User Menu
- Default link: secondary text color · Hover: primary text or subtle olive accent · Active page: olive accent + clear active state
- Authenticated user menu: Dashboard · Profile · Bookmarks · Settings · Sign Out
- Rule: navigation should stay simple and predictable. Do not overload the navbar.

**Tags / Topics** (React, Next.js, TypeScript, MongoDB, Node.js, community topics)
- Default: soft olive or dark neutral background, readable text, small radius
- Selected / active: primary olive accent
- Rule: tags should feel compact. Do not make every small label a pill.

**Content states**
- Loading — skeletons for content lists, button spinner for actions, avoid blank pages
- Empty — explain why content is empty, give a useful next action ("No bookmarks yet", "No posts in this community")
- Not Found — clear message, link back to relevant area
- Unauthorized — ask user to sign in
- Forbidden — explain that they do not have permission
- Server Error — clear fallback message, retry when appropriate

**Feedback rules**
- Feedback must be immediate and clear
- Do not rely on color only
- Messages should explain what happened
- Important actions should always show a state change

### 3.6.5 Premium Direction — Revision 2 (approved)

Changed after visual calibration: the first mockups used cards, colored pills and olive everywhere, which looked like a generic template. This revision keeps the same palette but uses it with more restraint. Where it conflicts with 3.6.1–3.6.3, this section wins.

**Premium rules**
1. Olive is rare. Max one filled olive element per screen. Everything else is neutral.
2. Typography leads, not boxes. Serif headings + hairline dividers instead of cards.
3. Big contrast in sizes: very large display type next to very small labels.
4. Generous empty space around every section.
5. Asymmetric layouts where it fits (featured item wide, list narrow). No uniform card grids.
6. Small radii only. No pills.
7. Mono details (labels, numbers, tags, shortcuts) give the "developer" feel.

**Olive usage**

| Color | Use for | Never for |
| --- | --- | --- |
| #66734B (Primary Olive) | Primary button background, button borders, list numbers, focus ring | Body or link text on dark (contrast 3.6:1, too low) |
| #A3B68A (Soft Olive) | Links, active nav underline, logo mark, one highlighted word in a headline | Button backgrounds |
| #354A2F (Dark Olive) | Primary button hover | Text |

**State colors (new)**

| Role | Hex |
| --- | --- |
| Error / destructive background | #B5524A |
| Error text | #E08A80 |
| Success text | #B9CC9C |

**Typography (updated)**
- Newsreader (serif): display, page titles, section titles, article titles
- Inter: navigation, body, buttons, forms, metadata
- JetBrains Mono: small labels, tags, list numbers, keyboard hints, code

| Style | Font | Size | Notes |
| --- | --- | --- | --- |
| Display | Newsreader 400 | 48–52px (34px mobile) | letter-spacing -0.025em, line-height 1.05 |
| H1 | Newsreader 400 | 34–36px | letter-spacing -0.015em |
| H2 / section title | Newsreader 400 | 19–24px |  |
| Article title (list) | Newsreader 400 | 16–17px |  |
| Body | Inter 400 | 15–16px | line-height 1.6 |
| UI / metadata | Inter 400 | 12–13px | Secondary text color |
| Label | JetBrains Mono 400 | 10.5–11px | letter-spacing 0.08em |

**Radius (updated):** 4px for buttons and inputs, 6px for containers. Nothing larger.

**Components (updated)**
- Primary button: #66734B background, white text, radius 4px, weight 500. One per screen.
- Secondary button: transparent, 0.5px #66734B border, #A3B68A text.
- Search: bottom border only, with a ⌘K hint in mono.
- Tags: plain mono text separated by " · " in secondary color. No background.
- Lists: rows with 0.5px #2B3127 dividers. No card containers.

**Semantic tokens** (components use only these names, never hex)

| Token | Dark (default) | Light (bonus: theme preference) |
| --- | --- | --- |
| --bg | #11140F | #F6F7F2 |
| --surface | #191D17 | #FFFFFF |
| --border | #2B3127 | #E1E4DA |
| --text | #F6F7F2 | #11140F |
| --text-muted | #AEB5A8 | #5C6356 |
| --accent | #66734B | #66734B |
| --accent-text | #A3B68A | #66734B |

Why tokens: link text needs a different olive in each theme (#A3B68A fails on white, #66734B fails on dark). With role-based tokens, light mode later means changing 7 values, not every component.

**Home reference (approved):** navbar with logo + 3 links + Sign in + outlined Join · hero with mono label "Vol. 01", serif headline "Where developers branch out." ("branch" in italic soft olive), short intro, underline search with ⌘K · featured essay (wide, left) + numbered latest list 01–03 (right) · communities as one inline row with member counts.

## 3.7 High-Fidelity UI Planning

**STATUS: DIRECTION APPROVED** (see 3.6.5 Premium Direction). Next step: build the Home high-fidelity screen from the approved reference.

### 3.7.1 First Screen to Design — Home / Explore

Goal: create the final visual direction of MainBranch using the approved wireframe and design system.

This screen will define: typography, spacing, navbar style, search style, community cards, article layout, topic tags, button appearance, section spacing.

**Home visual rules**
- Use the MainBranch logo and brand name
- Use olive #66734B as the main accent
- Use charcoal / dark neutral surfaces
- Use warm white for readable text
- Keep the page content-first
- Avoid excessive cards
- Avoid gradients
- Avoid glassmorphism
- Avoid huge rounded corners
- Avoid unnecessary decorative shapes
- Avoid generic SaaS sections
- Avoid generic symmetric grids everywhere

**Home screen build order**
1. Navbar
2. Hero
3. Search
4. Featured Communities
5. Latest Articles
6. Trending Topics
7. Developer Discovery
8. Footer

### 3.7.2 Design Review Questions

- [ ]  Does it look like a developer product?
- [ ]  Is the content easy to scan?
- [ ]  Is olive used as an accent, not everywhere?
- [ ]  Are cards used only when needed?
- [ ]  Is typography clear?
- [ ]  Is spacing consistent?
- [ ]  Does the page feel custom, not template-based?
- [ ]  Is any section visually unnecessary?
- [ ]  Does it match the MainBranch brand?
- [ ]  Does it avoid generic SaaS styling?

**Step 3 status: DIRECTION APPROVED.** Premium direction defined in 3.6.5; high-fidelity screens are next.

Completed: requirements, sitemap, page responsibilities, wireframes, component inventory, initial design system, brand name, logo direction, color palette.

To revisit: final visual direction, high-fidelity screens, responsive final UI.

---

# Step 4 — Technical Architecture

## 4.1 Tech Stack

| Technology | Role | Why We Use It |
| --- | --- | --- |
| Next.js 16 | Full-stack framework | Pages, Server Components, Client Components, Route Handlers |
| TypeScript | Language | Type safety and clearer contracts |
| Tailwind CSS | Styling | Required responsive UI styling |
| MongoDB Atlas | Database hosting | Stores application data in production |
| Mongoose | ODM | Defines MongoDB models and handles database operations |
| Auth.js | Authentication | GitHub + Google OAuth and sessions |
| Zod | Runtime validation | Validates form/API input before business logic |
| Vercel | Deployment | Deploys the Next.js application |
| Git + GitHub | Version control | Branches, commits, repository workflow |

**Architecture direction**

MainBranch will be built as a full-stack Next.js application. Next.js will handle both the UI and server-side application logic. MongoDB Atlas will store persistent data through Mongoose. Auth.js will handle authentication and sessions. Zod will validate external input. Route Handlers will be used when an HTTP API boundary is needed.

---

# Step 5 — Data Model

For each model: fields, who owns it, embed or reference and why, and which query each index serves.

| Model | Main fields | Relations (embed / reference + why) | Indexes (+ query they serve) |
| --- | --- | --- | --- |
| User | name, email, image (from OAuth), username (unique, used in /profile/[username], generated on first sign-in), headline, bio, skills[], createdAt | skills embedded as a small array of strings (limited list, always shown with the profile). Username is editable in /settings because Google sign-in gives no username (the generated one comes from the email). Rules: Zod regex ^[a-z0-9-]{3,20}$, unique (409 Conflict if taken). Old profile links break, like on GitHub; both the old and new profile paths are revalidated on save. Auth.js: the MongoDB adapter creates the users and accounts collections (accounts = one row per GitHub/Google login linked to a user). Our Mongoose User model uses the same users collection and adds username, headline, bio, skills. Sessions use the JWT strategy, so no database read on every request. Same email from GitHub and Google is not linked automatically (Auth.js default, safer): the user sees a message to sign in with the provider they used first. | { username } unique → /profile/[username] lookup + no duplicate usernames. { email } unique → Auth.js finds the user on sign-in. |
| Community | name, slug (unique), description, topics[], createdAt. No ownerId: communities come from seed data (no "create community" requirement). Member count is computed from Membership, not stored. | topics embedded as a small array of strings (limited list, always shown with the community). Members are NOT embedded, see Membership. Topics are a fixed list in constants/topics.ts, not a collection: there is no "create topic" requirement, Zod can validate with z.enum(TOPICS), and the /blogs?topic= filter has a known set of values. Posts use the same list. | { slug } unique → /communities/[slug] lookup. No search index on name: communities are a small seeded list, so a simple regex search is enough (no index just to say we used one). |
| Membership | userId, communityId, joinedAt | Separate collection that references User and Community. A popular community can have thousands of members, so an array inside Community would grow without limit (16MB document cap) and be loaded on every page view. One small document per join answers all membership questions (is X a member, member count, X's communities, member preview) with simple indexed queries, and keeps joinedAt. | { userId, communityId } unique → "is X a member of Y?" + blocks joining twice + "which communities did X join?" (userId is the first key). { communityId, joinedAt: -1 } → member count + latest members preview. |
| Post | title, slug (unique, from title), excerpt, content, topics[], communityId, authorId (from the session, never from the form), createdAt, updatedAt. Reading time is computed from content, not stored. | References its author (authorId → User) and its community (communityId → Community). A user or a community can have unlimited posts, so posts are never embedded in them. On delete (hard delete + cascade): deleting a post also deletes its comments and all bookmarks pointing to it, inside one MongoDB transaction so it never half-finishes. MongoDB has no automatic cascade, so this lives in the server logic. Soft delete (deletedAt) was considered and rejected for the MVP: every query would need a filter. | { slug } unique → /blogs/[slug]. { createdAt: -1 } → newest posts (/blogs, Home). { communityId, createdAt: -1 } → community page + filter by community. { authorId, createdAt: -1 } → profile, dashboard + filter by author. { topics, createdAt: -1 } → filter by topic. Text index on { title, excerpt } → /blogs?search=. |
| Comment | postId, authorId, content, createdAt | Separate collection: postId → Post, authorId → User. A post can get an unlimited number of comments, so they are not embedded in Post. | { postId, createdAt } → comments under a post, oldest first. The same index serves the cascade delete (deleteMany by postId). |
| Bookmark | userId, postId, createdAt | Separate collection that references User and Post, same pattern as Membership. A user can save an unlimited number of posts, so an array inside User has no limit. createdAt lets /bookmarks and the dashboard list saved posts newest first. | { userId, postId } unique → "did X save Y?" (bookmark button) + blocks saving twice. { userId, createdAt: -1 } → /bookmarks and dashboard, newest first. { postId } → cascade delete when a post is deleted. |

---

# Step 6 — API Contract

**Rule:** pages read data by calling lib/ directly from Server Components (no HTTP). Route Handlers are used for every mutation and for reads the browser needs (join state, bookmark state, client-side search). Every handler: check session → validate with Zod → check ownership → run lib/ function → return status.

**Error shape (same everywhere):** { error: { code, message, fields? } } — fields holds Zod errors per input so forms can show them next to the right field.

**Posts**

| Method | Path | Auth | Input (Zod) | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| GET | /api/posts | Public | query: search?, topic?, community?, author?, page=1, limit=10 | 200 { items, page, totalPages } | 400 invalid query |
| POST | /api/posts | Signed in + member of the community | title, excerpt, content, communityId, topics[] | 201 { post } | 400, 401, 403 not a member |
| GET | /api/posts/[id] | Public | — | 200 { post } | 404 |
| PATCH | /api/posts/[id] | Owner | title?, excerpt?, content?, topics? | 200 { post } | 400, 401, 403 not owner, 404 |
| DELETE | /api/posts/[id] | Owner | — | 204 (post + comments + bookmarks, one transaction) | 401, 403, 404 |

**Comments**

| Method | Path | Auth | Input (Zod) | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| POST | /api/posts/[id]/comments | Signed in | content | 201 { comment } | 400, 401, 404 post not found |
| DELETE | /api/comments/[id] | Comment owner | — | 204 | 401, 403, 404 |

**Communities & membership**

| Method | Path | Auth | Input (Zod) | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| GET | /api/communities | Public | query: search?, page=1 | 200 { items, page, totalPages } | 400 |
| GET | /api/communities/[id]/membership | Signed in | — | 200 { isMember } | 401, 404 |
| POST | /api/communities/[id]/membership | Signed in | — | 201 joined · 200 if already a member | 401, 404 |
| DELETE | /api/communities/[id]/membership | Signed in | — | 204 | 401, 404 |

**Bookmarks**

| Method | Path | Auth | Input (Zod) | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| GET | /api/bookmarks | Signed in | query: page=1 | 200 { items, page, totalPages } | 401 |
| GET | /api/posts/[id]/bookmark | Signed in | — | 200 { isBookmarked } | 401, 404 |
| POST | /api/posts/[id]/bookmark | Signed in | — | 201 saved · 200 if already saved | 401, 404 |
| DELETE | /api/posts/[id]/bookmark | Signed in | — | 204 | 401, 404 |

**Profile**

| Method | Path | Auth | Input (Zod) | Success | Errors |
| --- | --- | --- | --- | --- | --- |
| PATCH | /api/users/me | Signed in (own profile only) | username?, headline?, bio?, skills[]? | 200 { user } | 400, 401, 409 username taken |

**Decisions**
- /api/users/me instead of /api/users/[id]: the server takes the user from the session, so nobody can send another user's id.
- Join and bookmark are idempotent: doing it twice returns 200 instead of crashing on the unique index (500).
- Membership and bookmark are resources (POST = create, DELETE = remove), not verbs like /join and /leave.
- No separate /api/search: search is a query on /api/posts and /api/communities, like the pages.
- 401 = not signed in (who are you?). 403 = signed in but not allowed (I know you, but no). 404 = the resource does not exist.

---

# Step 7 — Authorization Rules

| Action | Who is allowed | Where the check happens |
| --- | --- | --- |
| Create blog | Signed-in user | POST /api/posts: no session → 401; not a member of the chosen community → 403. authorId comes from the session, never from the body. |
| Edit / delete blog | Blog owner | PATCH / DELETE /api/posts/[id]: no session → 401; post not found → 404; post.authorId !== session user → 403. The /blogs/[slug]/edit page checks the same thing, but only for UX. |
| Add comment | Signed-in user | POST /api/posts/[id]/comments: no session → 401; post not found → 404. authorId from the session. |
| Delete comment | Comment owner | DELETE /api/comments/[id]: no session → 401; not found → 404; comment.authorId !== session user → 403. |
| Bookmark / remove bookmark | Signed-in user (own bookmarks only) | /api/posts/[id]/bookmark and /api/bookmarks: no session → 401. userId always comes from the session, never from the body or URL, so a user can only touch their own bookmarks. |
| Join / leave community | Signed-in user | /api/communities/[id]/membership: no session → 401; community not found → 404. userId from the session only. |
| Edit profile | Profile owner | PATCH /api/users/me: no session → 401. There is no user id in the URL, so nobody can edit another profile. Username taken → 409. |

401 vs 403: 401 means "we don't know who you are" (no session). 403 means "we know who you are, but this is not yours". Order of checks in every handler: session (401) → validate input (400) → load the resource (404) → ownership (403).

**Where checks live (three layers)**
1. proxy.ts (Next.js 16, formerly middleware): redirects signed-out users away from /dashboard, /bookmarks, /settings, /create, /blogs/[slug]/edit to /signin. UX only, not security.
2. Protected pages: call auth() and redirect or notFound() before rendering, so users never see a form they cannot use. Also UX.
3. Route Handlers, next to the data: the real security. They check every request, because anyone can call the API directly without passing through layers 1 and 2.

Rule: layers 1 and 2 make the experience nicer; layer 3 is mandatory and never skipped. A hidden Edit button is not security.

---

# Step 8 — Server vs Client Components

**Rule:** Server Component by default. "use client" only when the component needs the browser: clicks with state, typing, useState/useEffect, usePathname, or browser APIs. Pages stay on the server and include small client "islands".

**Client components (the only files with "use client")**
- BookmarkButton — click + saved state; asks the server for isBookmarked, so /blogs/[slug] stays ISR
- JoinLeaveButton — same pattern on /communities/[slug]
- OwnerActions (Edit / Delete on a blog) and EditProfileButton — shown only to the owner on ISR pages; Delete needs a confirm dialog
- CommentForm — typing, client validation, submitting state
- BlogForm (create + edit) and ProfileForm (/settings) — client Zod feedback next to each field
- SearchBar and Filters — typing / selecting updates the URL (?search=, ?topic=); SearchBar also works as a plain GET form without JavaScript
- NavLink — highlights the active page with usePathname
- UserMenu — dropdown open/close state

**Server Components (everything else)**
- All pages and layouts, Navbar shell, Footer
- BlogCard, BlogListItem, FeaturedBlog, ArticleContent, BlogMeta
- CommunityCard, CommunityHeader, ProfileHeader, DeveloperCard
- Pagination (plain links), EmptyState, LoadingSkeleton

**Why this matters:** client components send JavaScript to the browser. Keeping them small keeps pages fast, and data fetching stays on the server where the session and database are.

---

# Step 9 — Execution Plan

**Setup:** solo developer, one GitHub repo, deployed to Vercel from day one.

**Folder structure**

```
app/                 routes, layouts, loading/error/not-found, app/api/* Route Handlers
components/
  ui/                Button, Input, Badge, Skeleton, EmptyState (design system)
  layout/            Navbar, NavLink, UserMenu, Footer
  blog/  community/  profile/   feature components
lib/                 db.ts (connection), posts.ts, communities.ts, ... (server-only data logic)
models/              Mongoose models
schemas/             Zod schemas (shared by forms and Route Handlers)
constants/           topics.ts, navigation.ts
types/               shared TypeScript types
scripts/seed.ts      seed communities + sample data
auth.ts              Auth.js config
proxy.ts             redirects for protected pages (UX only)
.env.example         variable names only, no values
```

**Git workflow**
- main is always deployable. Never work directly on main.
- One branch per milestone or feature: feature/auth, feature/communities, fix/bookmark-state
- Commit style (one logical change per commit): feat: … · fix: … · refactor: … · docs: … · chore: …
- Even solo, every branch goes through a Pull Request: short description (what + why), check the Vercel preview, then merge. The PR history shows how the project was built.
- Pull before starting work; never commit .env.local.

**Environment variables (names only, values live in .env.local and Vercel)**
MONGODB_URI · AUTH_SECRET · AUTH_GITHUB_ID · AUTH_GITHUB_SECRET · AUTH_GOOGLE_ID · AUTH_GOOGLE_SECRET

**Milestones (each one = a GitHub issue, built as a vertical slice: model → schema → lib → API → UI → states)**
0. Walking skeleton — Next.js + TypeScript + Tailwind + ESLint, folder structure, .env.example, first deploy to Vercel
1. Design system + app shell — tokens, fonts, Navbar, Footer, layout, ui components
2. Database — Atlas cluster, db connection, models, indexes, seed script
3. Auth — GitHub + Google, /signin, proxy.ts, username generation, callbackUrl
4. Communities — list + details (ISR), membership API + JoinLeaveButton
5. Posts — create / edit / delete, blog details, BlogForm, cascade delete
6. Discovery — /blogs search, filters, pagination
7. Comments + Bookmarks
8. Profile, Settings, Dashboard
9. States + polish — loading / empty / error / not-found, mobile, accessibility
10. Release — README, production OAuth callbacks, submission checklist, defense practice

**Definition of Done (every milestone)**
Validated on the server · protected where needed · loading / empty / error states · works on mobile · deployed preview checked · I can explain every line.
