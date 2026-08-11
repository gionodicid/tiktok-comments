"use client";

import { useState, useCallback } from "react";
import { X, Search, ArrowDownUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Comment, CommentUser } from "./comment-data";
import { CommentItem } from "./comment-item";
import { CommentInputBar, Attachment } from "./comment-input-bar";

export interface CommentSectionProps {
  comments: Comment[];
  currentUser?: CommentUser;
  onSubmit: (text: string, attachment?: Attachment, replyTo?: string) => void;
  onLike: (commentId: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
  onReply?: (commentId: string, username: string) => void;
  className?: string;
  theme?: "dark" | "light";
}

export function CommentSection({
  comments,
  currentUser,
  onSubmit,
  onLike,
  onLikeReply,
  onReply,
  className,
  theme = "dark",
}: CommentSectionProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"top" | "recent">("top");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  const handleReply = useCallback(
    (commentId: string, username: string) => {
      setReplyingTo(username);
      onReply?.(commentId, username);
    },
    [onReply],
  );

  const handleSubmit = useCallback(
    (text: string, attachment?: Attachment) => {
      onSubmit(text, attachment, replyingTo ?? undefined);
      setReplyingTo(null);
    },
    [onSubmit, replyingTo],
  );

  const filtered = searchQuery
    ? comments.filter(
        (c) =>
          c.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activeTab === "top"
      ? [...comments].sort((a, b) => b.likes - a.likes)
      : [...comments].sort((a, b) => {
          const rank = (t: string) =>
            t === "now" ? 0 : t.includes("h") ? 1 : 2;
          return rank(a.timestamp) - rank(b.timestamp);
        });

  return (
    <div
      className={cn(
        "tcm-root tcm-flex tcm-flex-col tcm-h-full tcm-w-full tcm-overflow-x-hidden tcm-font-sans tcm-antialiased",
        theme === "dark" && "dark",
        className,
      )}
      data-theme={theme}
      style={{ background: "var(--background)" }}
    >
      <header
        className="tcm-sticky tcm-top-0 tcm-z-10 tcm-border-b tcm-border-border tcm-px-3 tcm-sm:tcm-px-4 tcm-pt-3 tcm-sm:tcm-pt-4 tcm-pb-0"
        style={{ background: "var(--background)" }}
      >
        <div className="tcm-flex tcm-items-center tcm-justify-between tcm-mb-3">
          <h2 className="tcm-text-base tcm-font-bold tcm-text-foreground">
            {totalComments.toLocaleString()} comments
          </h2>
          <div className="tcm-flex tcm-items-center tcm-gap-1">
            <button
              onClick={() => setSearchOpen((s) => !s)}
              className="tcm-w-8 tcm-h-8 tcm-flex tcm-items-center tcm-justify-center tcm-rounded-full tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
              aria-label="Search comments"
            >
              <Search size={18} />
            </button>
            <button
              className="tcm-w-8 tcm-h-8 tcm-flex tcm-items-center tcm-justify-center tcm-rounded-full tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
              aria-label="Sort comments"
            >
              <ArrowDownUp size={18} />
            </button>
            <button
              className="tcm-w-8 tcm-h-8 tcm-flex tcm-items-center tcm-justify-center tcm-rounded-full tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
              aria-label="Close comments"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {searchOpen && (
          <div className="tcm-flex tcm-items-center tcm-gap-2 tcm-bg-input tcm-rounded-xl tcm-px-3 tcm-py-2 tcm-mb-3">
            <Search size={14} className="tcm-text-muted-foreground tcm-shrink-0" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments…"
              className="tcm-flex-1 tcm-bg-transparent tcm-text-sm tcm-text-foreground tcm-placeholder:tcm-text-muted-foreground tcm-outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} aria-label="Clear search">
                <X size={14} className="tcm-text-muted-foreground tcm-hover:tcm-text-foreground" />
              </button>
            )}
          </div>
        )}
        {!searchOpen && (
          <div className="tcm-flex tcm-gap-1">
            {(["top", "recent"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tcm-px-4 tcm-py-2 tcm-text-sm tcm-font-semibold tcm-capitalize tcm-rounded-t-lg tcm-transition-colors tcm-border-b-2 ${
                  activeTab === tab
                    ? "tcm-border-foreground tcm-text-foreground"
                    : "tcm-border-transparent tcm-text-muted-foreground tcm-hover:tcm-text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        )}
      </header>
      <main
        className="tcm-flex-1 tcm-overflow-y-auto tcm-pb-2 tcm-no-scrollbar"
        aria-label="Comments list"
      >
        {filtered.length === 0 ? (
          <div className="tcm-flex tcm-flex-col tcm-items-center tcm-justify-center tcm-py-20 tcm-text-muted-foreground tcm-gap-2">
            <Search size={32} className="tcm-opacity-30" />
            <p className="tcm-text-sm">No comments found</p>
          </div>
        ) : (
          <ul>
            {filtered.map((comment) => (
              <li key={comment.id} className="tcm-border-b tcm-border-border/40 tcm-last:tcm-border-0">
                <CommentItem
                  comment={comment}
                  onLike={onLike}
                  onLikeReply={onLikeReply}
                  onReply={(username) => handleReply(comment.id, username)}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
      <CommentInputBar
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSubmit={handleSubmit}
        currentUser={currentUser}
      />
    </div>
  );
}
