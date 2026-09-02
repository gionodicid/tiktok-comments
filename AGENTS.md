# TikTok Comments Library (`tik-tok-discord-ui-2`) — Agent Guide

Publishable React UI package **`tiktok-comments`**: TikTok-style comment section with Discord-like extras (badges, aura, stickers, mentions).

**Not a full app.** Host apps (e.g. Shinigami) own data, auth, and routing.

## Stack (do not replace without explicit ask)

| Concern | Choice |
|---------|--------|
| Build | Vite lib (`vite.lib.config.ts`) → CJS + ESM + types + CSS |
| Demo | Vite app under `demo/` |
| React | Peer `>=18` (web / Next via `"use client"`) |
| Styling | Tailwind 3 with **`tcm-` prefix** + CSS vars under `.tcm-root` |
| Utils | `cn()` in `src/lib/utils.ts` |
| Icons | `lucide-react` |
| State | Local React state only — **no** Zustand / Context / React Query |
| Routing / forms | **None** inside the library |
| Data | `fetch` against `url` + `response` mapper — no React Query / Axios |

Package exports:

- `tiktok-comments` → `CommentSection` + types/helpers
- `tiktok-comments/styles.css` → built CSS (hosts should prefer this over vendoring copies)

## Folderization

```
tik-tok-discord-ui-2/
  AUDIT.md              # UI readiness: dead/broken vs done
  demo/                 # Playground only — not published
    api/                # In-memory mock API (Vite middleware, Faker seed)
  src/
    index.ts            # Public barrel (ONLY package API)
    styles.css          # Tailwind entry + design tokens
    components/         # Flat UI modules (kebab-case)
    lib/                # cn(), mention-parser
  scripts/              # CSS validation / prefix helpers
  vite.config.ts        # Demo
  vite.lib.config.ts    # Library build
```

### Where new code goes

| Kind of change | Put it here |
|----------------|-------------|
| Visible UI piece | `src/components/<name>.tsx` (flat — no deep feature trees) |
| Domain types / catalogs | Prefer `comment-data.ts` or next to the owning component |
| Shared non-UI helper | `src/lib/` |
| Public export | Re-export from `src/index.ts` only if it is part of the contract |
| Demo / mocks for playground | `demo/` — **not** baked into published components when avoidable |

Do **not** add `src/hooks/`, `src/pages/`, `src/stores/`, `src/queries/`, or a shadcn `ui/` tree unless the package intentionally grows that large.

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `comment-section.tsx` |
| Components | PascalCase named `export function` | `CommentSection` |
| Props | `XxxProps` interface colocated | `CommentSectionProps` |
| Domain types | PascalCase interfaces / union types | `Comment`, `SubscriptionTier` |

## Public API pattern

Host passes the comments resource URL and a response mapper. The library fetches, searches, sorts, paginates, likes, dislikes, mention profiles, and submits.

```ts
export interface CommentSectionProps {
  url: string;
  response: (raw: unknown) => CommentApiPayload;
  endpoints?: CommentSectionEndpointsConfig;
  className?: string;
  theme?: "dark" | "light";
  showThemeToggle?: boolean;
  onThemeChange?: (theme: "dark" | "light") => void;
  onViewProfile?: (profile: CommentProfile) => void;
  /** Host moderation when a posted sticker is reported. */
  onReportSticker?: (src: string) => void;
}
```

Expected resource (defaults from `url`; override via `endpoints` prop):

- `list` — `GET` with `q`, `sort`, `offset`, `limit`
- `submit` — `POST` body `{ text, attachment?, replyTo? }`
- `likeComment` / `dislikeComment` — `POST`
- `likeReply` / `dislikeReply` — `POST`
- `users` — mention directory (`users` on the payload)
- `userByName` — profile lookup (`user` on the payload)
- `stickers` — sticker catalog (`stickers`, `packs`; query `pack`, `q`, `favorites`, `kind`)
- `stickerFavorite` — toggle favorite (`sticker` on the payload)

Composition (internal):

```
CommentSection
├── CommentItem → ReplyList / drawers / lightbox
└── CommentInputBar → sticker / image / mention selectors
```

Keep subcomponents out of `src/index.ts` unless they become a deliberate secondary export.

## Styling rules (critical)

1. Tailwind classes **must** use the `tcm-` prefix in class strings: `tcm-flex`, `tcm-text-sm`, …
2. Root wrapper includes `tcm-root` (and `dark` when `theme === "dark"`).
3. **Never** put `tcm-` into raw DOM/CSS APIs or inline style values:
   - ❌ `document.body.style.overflow = "tcm-hidden"`
   - ✅ `document.body.style.overflow = "hidden"`
   - ❌ `style={{ border: "tcm-1px solid …" }}`
   - ✅ `className="tcm-border"` or `style={{ border: "1px solid var(--border)" }}`
4. Prefer `cn()` for conditional classes.
5. Light theme tokens must actually differ if `theme="light"` is supported — do not leave light === dark.

## TypeScript

- Prefer `interface` for object shapes; `type` for unions/aliases.
- Colocate props with components; domain types in `comment-data.ts`.
- Named exports only from the package barrel (demo `App` may default-export).

## Anti-patterns

- Do not add routers, Axios, React Query, or global stores to this package.
- Do not ship demo-only mock behavior (fake image URLs, mock users) in published paths when the host should supply data — keep mocks in `demo/` when possible.
- Do not create nested `components/feature/...` trees; stay flat unless complexity forces a clear split.
- Do not remove `"use client"` from components that use hooks/state (Next App Router consumers).
- Do not invent a second class-prefix or unprefixed Tailwind in `src/` (breaks host isolation).

## Consumer reminder (Shinigami)

Host serves a comments API matching the `{url}` contract, maps JSON via `response`, and imports styles. Library must remain usable without Shinigami-specific imports.
