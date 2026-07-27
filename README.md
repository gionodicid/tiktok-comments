# tiktok-comments

TikTok-style comment section UI packaged as a React library with isolated Tailwind CSS (`tcm:` prefix) for safe use in host apps.

## Install

```bash
npm install tiktok-comments
```

## Usage (React SPA)

```tsx
import { useState, useCallback } from "react";
import { CommentSection } from "tiktok-comments";
import type { Attachment, Comment } from "tiktok-comments";
import "tiktok-comments/styles.css";

export function VideoComments() {
  const [comments, setComments] = useState<Comment[]>([]);

  const handleSubmit = useCallback((text: string, attachment?: Attachment, replyTo?: string) => {
    // persist to your API, then update state
  }, []);

  return (
    <CommentSection
      comments={comments}
      currentUser={{ name: "You", avatar: "/avatar.png" }}
      onSubmit={handleSubmit}
      onLike={(id) => { /* ... */ }}
      onLikeReply={(commentId, replyId) => { /* ... */ }}
      theme="dark"
    />
  );
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

import { CommentSection } from "tiktok-comments";

export default function CommentsPage() {
  return <CommentSection comments={[]} onSubmit={() => {}} onLike={() => {}} onLikeReply={() => {}} />;
}
```

## API

`CommentSection` is a controlled component. You own comment state and wire it to your backend.

| Prop | Type | Description |
|------|------|-------------|
| `comments` | `Comment[]` | Comment list to render |
| `currentUser` | `{ name, avatar }` | Shown in the input bar |
| `onSubmit` | `(text, attachment?, replyTo?) => void` | New comment submitted |
| `onLike` | `(commentId) => void` | Top-level comment liked |
| `onLikeReply` | `(commentId, replyId) => void` | Reply liked |
| `onReply` | `(commentId, username) => void` | Optional reply intent callback |
| `theme` | `"dark" \| "light"` | Default `"dark"` |
| `className` | `string` | Extra classes on root |

Exported types: `Comment`, `Reply`, `Attachment`, `CommentUser`, `EarnedBadge`, `SubscriptionTier`.

## CSS isolation

All Tailwind utilities use the `tcm:` prefix (e.g. `tcm:flex`, `tcm:hover:tcm:bg-muted`). Theme tokens are scoped under `.tcm-root`, so host app CSS variables are not overwritten.

## Development

```bash
npm install
npm run dev        # demo playground
npm run check      # typecheck + lint
npm run build      # library + CSS to dist/
```

## License

MIT
