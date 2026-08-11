"use client";

import { useEffect, useCallback } from "react";
import { Circle } from "lucide-react";

interface MentionSelectorProps {
  onSelect: (username: string) => void;
  onClose: () => void;
}

const MOCK_USERS = [
  {
    id: "1",
    name: "Leon Go",
    username: "leon_go3000",
    avatar: "https://picsum.photos/40/40?random=100",
    badge: "Friends",
  },
  {
    id: "2",
    name: "Original Creator",
    username: "original_creator",
    avatar: "https://picsum.photos/40/40?random=101",
    badge: "Following",
  },
  {
    id: "3",
    name: "Vibes Only",
    username: "vibes_only_42",
    avatar: "https://picsum.photos/40/40?random=102",
    badge: "Following",
  },
  {
    id: "4",
    name: "Alex V111",
    username: "alex_v111",
    avatar: "https://picsum.photos/40/40?random=103",
    badge: "Friends",
  },
];

const QUICK_EMOJIS = ["😀", "❤️", "🔥", "👍", "😂", "🎉"];

export function MentionSelector({ onSelect, onClose }: MentionSelectorProps) {
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

  const handleUserClick = (username: string) => {
    onSelect(username);
    onClose();
  };

  return (
    <div
      className="tcm-absolute tcm-bottom-full tcm-left-0 tcm-right-0 tcm-z-20 tcm-border-t tcm-border-border tcm-rounded-t-2xl tcm-animate-in tcm-slide-in-from-bottom-4 tcm-duration-200"
      style={{ background: "var(--card)", maxHeight: "60vh" }}
    >
      {/* User list */}
      <div className="tcm-overflow-y-auto" style={{ maxHeight: "calc(60vh - 60px)" }}>
        {MOCK_USERS.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserClick(user.username)}
            className="tcm-w-full tcm-flex tcm-items-center tcm-gap-3 tcm-px-4 tcm-py-3 tcm-hover:tcm-bg-muted/50 tcm-transition-colors tcm-text-left"
          >
            <img
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              className="tcm-rounded-full tcm-object-cover tcm-shrink-0 tcm-w-10 tcm-h-10"
            />
            <div className="tcm-flex-1 tcm-min-w-0">
              <div className="tcm-flex tcm-items-center tcm-gap-2">
                <span className="tcm-text-sm tcm-font-semibold tcm-text-foreground tcm-truncate">
                  {user.name}
                </span>
                <span
                  className="tcm-text-[10px] tcm-px-1.5 tcm-py-0.5 tcm-rounded-full tcm-shrink-0"
                  style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                >
                  {user.badge}
                </span>
              </div>
              <span className="tcm-text-xs tcm-text-muted-foreground">@{user.username}</span>
            </div>
            <Circle size={20} className="tcm-text-muted-foreground tcm-shrink-0" />
          </button>
        ))}
      </div>

      {/* Quick emoji row */}
      <div className="tcm-flex tcm-items-center tcm-justify-around tcm-px-4 tcm-py-3 tcm-border-t tcm-border-border">
        {QUICK_EMOJIS.map((emoji, i) => (
          <button
            key={i}
            className="tcm-w-10 tcm-h-10 tcm-flex tcm-items-center tcm-justify-center tcm-text-xl tcm-hover:tcm-bg-muted tcm-rounded-lg tcm-transition-colors"
            aria-label={`Insert ${emoji}`}
            onClick={() => {
              /* Could append emoji to input */
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
