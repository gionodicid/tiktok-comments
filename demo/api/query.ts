import { timestampMs } from "../../src/lib/format-comment-time";
import type { Comment } from "../../src/components/comment-data";

export type CommentSort = "top" | "recent";

export function matchesQuery(comment: Comment, query: string): boolean {
  const q = query.toLowerCase();
  if (comment.text.toLowerCase().includes(q) || comment.name.toLowerCase().includes(q)) {
    return true;
  }
  return comment.replies.some(
    (r) => r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
  );
}

export function sortComments(comments: Comment[], sort: CommentSort): Comment[] {
  return [...comments].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    if (sort === "top") return b.likes - a.likes;
    return timestampMs(b.timestamp) - timestampMs(a.timestamp);
  });
}

export function totalItems(comments: Comment[]): number {
  return comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);
}
