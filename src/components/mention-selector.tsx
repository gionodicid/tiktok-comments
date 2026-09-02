"use client";

import { useEffect, useCallback } from "react";
import { CommentProfile } from "./comment-data";

interface MentionSelectorProps {
  users: CommentProfile[];
  loading?: boolean;
  onSelect: (name: string) => void;
  onInsertEmoji: (emoji: string) => void;
  onClose: () => void;
}

const QUICK_EMOJIS = ["😀", "❤️", "🔥", "👍", "😂", "🎉"];

export function MentionSelector({
  users,
  loading,
  onSelect,
  onInsertEmoji,
  onClose,
}: MentionSelectorProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleUserClick = (name: string) => {
    onSelect(name);
    onClose();
  };

  return (
    <div
      className="tcm-absolute tcm-bottom-full tcm-left-0 tcm-right-0 tcm-z-20 tcm-border-t tcm-border-border tcm-rounded-t-2xl tcm-animate-in tcm-slide-in-from-bottom-4 tcm-duration-200"
      style={{ background: "var(--card)", maxHeight: "60dvh" }}
    >
      <div className="tcm-overflow-y-auto" style={{ maxHeight: "calc(60dvh - 60px)" }}>
        {loading ? (
          <p className="tcm-px-4 tcm-py-6 tcm-text-sm tcm-text-muted-foreground">Loading…</p>
        ) : users.length === 0 ? (
          <p className="tcm-px-4 tcm-py-6 tcm-text-sm tcm-text-muted-foreground">No people to mention</p>
        ) : (
          users.map((user) => (
            <button
              key={user.name}
              type="button"
              onClick={() => handleUserClick(user.name)}
              className="tcm-w-full tcm-flex tcm-items-center tcm-gap-3 tcm-px-4 tcm-py-3 tcm-hover:tcm-bg-muted/50 tcm-transition-colors tcm-text-left"
            >
              <img
                src={user.avatar}
                alt={`${user.name}'s avatar`}
                className="tcm-rounded-full tcm-object-cover tcm-shrink-0 tcm-w-10 tcm-h-10"
              />
              <div className="tcm-flex-1 tcm-min-w-0">
                <span className="tcm-text-sm tcm-font-semibold tcm-text-foreground tcm-truncate tcm-block">
                  {user.name}
                </span>
                {user.subscription && (
                  <span className="tcm-text-xs tcm-text-muted-foreground tcm-uppercase">
                    {user.subscription}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="tcm-flex tcm-items-center tcm-justify-around tcm-px-4 tcm-py-3 tcm-border-t tcm-border-border">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            className="tcm-w-10 tcm-h-10 tcm-flex tcm-items-center tcm-justify-center tcm-text-xl tcm-hover:tcm-bg-muted tcm-rounded-lg tcm-transition-colors"
            aria-label={`Insert ${emoji}`}
            onClick={() => onInsertEmoji(emoji)}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
