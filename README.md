# tiktok-comments

TikTok-style comment section UI packaged as a React library with isolated Tailwind CSS (`tcm:` prefix) for safe use in host apps.

## Install

```bash
npm install tiktok-comments
```

## Usage (React SPA)

```tsx
import { CommentSection, type CommentApiPayload } from "tiktok-comments";
import "tiktok-comments/styles.css";

function mapResponse(raw: unknown): CommentApiPayload {
  return raw as CommentApiPayload;
}

export function VideoComments() {
  return <CommentSection url="/api/comments" response={mapResponse} theme="dark" />;
}
```

## Usage (Next.js App Router)

Import the CSS once in your root layout:

```tsx
import "tiktok-comments/styles.css";
```

Use the component in a client page or client component:

```tsx
"use client";

import { CommentSection, type CommentApiPayload } from "tiktok-comments";

export default function CommentsPage() {
  return <CommentSection url="/api/comments" response={(raw) => raw as CommentApiPayload} />;
}
```

## API

`CommentSection` fetches from `url`. Map your API JSON with `response`.

| Prop | Type | Description |
|------|------|-------------|
| `url` | `string` | Comments resource, e.g. `/api/comments` |
| `response` | `(raw: unknown) => CommentApiPayload` | Maps list and mutation JSON |
| `endpoints` | `Partial<CommentSectionEndpoints>` | Per-route URL overrides; unset keys default from `url` (see below) |
| `theme` | `"dark" \| "light"` | Default `"dark"` |
| `className` | `string` | Extra classes on root |
| `showThemeToggle` | `boolean` | Show theme toggle beside search. Default `false` |
| `onThemeChange` | `(theme: "dark" \| "light") => void` | Called when user toggles theme (use with `theme` for controlled mode) |
| `onViewProfile` | `(profile: CommentProfile) => void` | Optional host navigation for View profile (overrides `profile.profileUrl`) |
| `onReportSticker` | `(src: string) => void` | Optional host handler when user reports a posted sticker |

**`endpoints` defaults** (all derived from `url` unless overridden):

| Key | Default | Method |
|-----|---------|--------|
| `list` | `url` | GET + `q`, `sort`, `offset`, `limit` |
| `submit` | `url` | POST |
| `likeComment(id)` | `{url}/{id}/like` | POST |
| `dislikeComment(id)` | `{url}/{id}/dislike` | POST |
| `likeReply(commentId, replyId)` | `{url}/{commentId}/replies/{replyId}/like` | POST |
| `dislikeReply(commentId, replyId)` | `{url}/{commentId}/replies/{replyId}/dislike` | POST |
| `users` | `{url}/users` | GET |
| `userByName(name)` | `{url}/users?name=` | GET |
| `stickers` | `{url}/stickers` | GET + query |
| `stickerFavorite(id)` | `{url}/stickers/{id}/favorite` | POST |

```tsx
<CommentSection
  url="/api/comments"
  response={mapResponse}
  endpoints={{
    users: "/api/authors",
    userByName: (name) => `/api/authors?name=${encodeURIComponent(name)}`,
    stickers: "/api/sticker-catalog",
  }}
/>
```

Exported helpers: `defaultCommentSectionEndpoints`, `resolveCommentSectionEndpoints`, types `CommentSectionEndpoints`, `CommentSectionEndpointsConfig`.

Exported types: `Comment`, `Reply`, `Attachment`, `CommentUser`, `CommentProfile`, `EarnedBadge`, `SubscriptionTier`, `ReplyTarget`, `CommentSort`, `CommentApiPayload`.

## CSS isolation

All Tailwind utilities use the `tcm:` prefix (e.g. `tcm:flex`, `tcm:hover:tcm:bg-muted`). Theme tokens are scoped under `.tcm-root`, so host app CSS variables are not overwritten.

## Development

```bash
npm install
npm run dev        # demo playground + in-memory mock API (`/api/comments`)
npm run check      # typecheck + lint
npm run build      # library + CSS to dist/
```

## License

MIT
