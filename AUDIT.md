# tiktok-comments UI audit

Living checklist of things that **look interactive but do nothing**, or **are wired but broken**. Scope is this package (`tik-tok-discord-ui-2`). Shinigami host issues are tagged **Host** and stay out of library slices unless we explicitly pick them up.

Update status here when a row is fixed. Do not copy app architecture into the library.

| Status | Meaning |
|--------|---------|
| Done | Fixed in library source (demo mock API where noted) |
| Open | Still dead or broken |
| Host | Shinigami consumer, not this package |

Suggested next library slices:

1. Shinigami host wiring (separate codebase)

---

## CommentSection (header / list)

| Item | Finding | Status |
|------|---------|--------|
| Sort button (`ArrowDownUp`) | No `onClick`. Dead. | Done — icon removed; Top/Recent tabs remain |
| Close button (`X`) | No `onClick`, no `onClose` prop. Dead. | Done — icon removed |
| Recent tab | Sort was fake: buckets `"now"` / contains `"h"` / else. `"48m"` and `"3d"` ranked the same. | Done — ISO UTC timestamps, numeric Recent sort |
| Pinned comments | Pin icon showed, but they were not kept at the top. | Done — pin always first, then tab sort |
| Search | Only matched top-level `text` / `name`. Replies ignored. | Done — server-side `q`, reply matches expand the parent |
| Reply submit | `replyTo` was a username, not a comment id. Host could not nest. | Done — `ReplyTarget` `{ commentId, replyId?, username, text }` |

Also landed with that slice (not in the original list): search debounce, search icon → X when open, Load more pagination (page size 5), reply banner shows original message and scrolls to the input.

---

## CommentItem / ReplyItem

| Item | Finding | Status |
|------|---------|--------|
| Dislike (`ThumbsDown`) | No handler, no state. Dead. | Done — TikTok-style mutex with like; `POST {url}/{id}/dislike` and reply equivalent; no dislike count |
| @mention links | `preventDefault()` only; never opened a profile. | Done — click `GET {url}/users?name=` and opens `ProfileDrawer` |
| Mention highlighting | Global regex + `.test()` skipped some `@mentions`. | Done — no `/g` + `.test()` |
| Names with spaces | `@Leon Go` not a mention (`[a-zA-Z0-9_]+` only). | Done — longest-first known display names + handle fallback |

---

## CommentInputBar

| Item | Finding | Status |
|------|---------|--------|
| Send hidden on mobile | `tcm-hidden tcm-lg:tcm-flex`. Phones can only submit with Enter. | Done — send is `tcm-flex` on expanded and collapsed layouts |
| Image attach | No file picker — always attaches hardcoded Picsum URL (`MOCK_IMAGE_URL`). | Done — ImagePicker: device file/photo, URL field, picsum stock grid |
| Edit attachment (pencil) | No `onClick`. Dead. | Done — image reopens ImagePicker; sticker reopens StickerSelector |
| Reply nesting | Banner was cosmetic; demo and Shinigami prepended a new top-level comment. | Done in **demo** via `replyTo`. **Host** still on published npm until Shinigami is rewired |
| Attachment dropped on submit | Shinigami host ignores `attachment` (image/sticker). | Host |

---

## StickerSelector

| Item | Finding | Status |
|------|---------|--------|
| Search / Favorites / Emoji / pack icons | No handlers. Dead. | Done — modes call `GET {url}/stickers` with `q`, `favorites`, `kind=emoji`, or `pack` |
| Grid | Hardcoded `picsum` mocks, not real packs. Pack switching does nothing. | Done — Faker-seeded catalog + pack tabs; star toggles `POST {url}/stickers/{id}/favorite` |

Grid pick → preview **does** work.

---

## StickerDrawer (tap a posted sticker)

| Item | Finding | Status |
|------|---------|--------|
| Report / Share / Save | No handlers. Dead. | Done — Share (Web Share / clipboard), Save (download blob), Report via optional `onReportSticker` on `CommentSection` |
| Scroll lock | `document.body.style.overflow = "tcm-hidden"` is invalid CSS. | Done — `useBodyScrollLock` sets `hidden` |

---

## MentionSelector

| Item | Finding | Status |
|------|---------|--------|
| Quick emoji row | Closes the panel and does not insert the emoji (comment: “Could append”). | Done — inserts into the textarea; panel stays open |
| User list | Hardcoded mocks (`leon_go3000`, …), not thread / API authors. Composed `@handle` will not resolve in `ProfileDrawer`. | Done — `GET {url}/users` directory; inserts `@Display Name` |

Picking a user inserts `@Display Name` and closes the panel.

---

## ProfileDrawer (tap avatar)

| Item | Finding | Status |
|------|---------|--------|
| “View profile →” | No `onClick`. Dead. | Done — opens `profile.profileUrl` or `onViewProfile` from `CommentSection` |
| Aura / Comments / Manga Read / Rank | Hardcoded (`MOCK_AURA = 1240`, fake stats), not user data. | Done — `GET {url}/users?name=` returns `aura`, `commentCount`, `mangaReadCount`, `rank`, `profileUrl` |
| Aura tooltip border | `border: "tcm-1px tcm-solid tcm-var(--border)"` is invalid inline CSS. | Done — `tcm-border tcm-border-border` |
| Stats grid dividers | `background: "tcm-var(--border)"` is invalid; 3-col grid has no gap lines. | Done — `background: "var(--border)"` with `gap-px` |

Avatar / mention open-close **does** work. Avatar tap now fetches full profile via `GET {url}/users?name=` (same as mentions).

---

## BadgeDrawer

| Item | Finding | Status |
|------|---------|--------|
| Close (`X`) | `position: absolute` but panel is not `relative` — button can sit on the viewport. | Done — panel has `tcm-relative` |
| Profile badges | Badges in the profile drawer are not clickable (comment-row badges are). | Done — profile badge pills open `BadgeDrawer` at `z-[60]` |

Comment-row badge tap → badge sheet **does** work.

---

## Lightbox

| Item | Finding | Status |
|------|---------|--------|
| Body scroll lock | Same `"tcm-hidden"` bug as `StickerDrawer`. Opens/closes otherwise. | Done — `useBodyScrollLock` |

---

## BadgeIcon / theme

| Item | Finding | Status |
|------|---------|--------|
| Light theme | `.tcm-root` and `.tcm-root.dark` use the same tokens. `theme="light"` only skips the `dark` class; colors stay dark. | Done — light tokens on `.tcm-root`, dark on `.tcm-root.dark` |

---

## What already works

- Like (heart) on comments and replies
- Dislike mutex + persist on mock API
- Reply banner, cancel, scroll-to-input, nested replies in the demo
- Search toggle, debounce, server-side `q`, Load more
- Top / Recent tabs with pin-first ISO sort
- Expand / collapse replies (search can force-expand)
- Sticker grid pick → preview; image/sticker lightbox/drawer open/close with scroll lock
- Mention highlight + click → profile (seeded display names)
- Mention user pick → insert `@Display Name` from `GET {url}/users`
- Image attach from device / URL / stock; pencil replaces; send on mobile
- Badge tap on a comment → badge sheet
- Profile drawer open/close from avatar

---

## Host (Shinigami) — do not mix into this package

- App still consumes published `tiktok-comments@0.2.0`, not local source
- Submit may still drop `attachment` and fail to nest `replyTo`
- Real comments API must match `{url}` + `response` (`like`, `dislike`, `users`, `users?name=`, list query params)

See [`AGENTS.md`](./AGENTS.md) for the library contract.
