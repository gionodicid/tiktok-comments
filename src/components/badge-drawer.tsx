"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { EarnedBadge } from "./comment-data";
import { BadgeIcon } from "./badge-icon";

interface BadgeDrawerProps {
  badge: EarnedBadge;
  onClose: () => void;
  className?: string;
}

const RARITY_COLORS: Record<EarnedBadge["rarity"], string> = {
  common: "#9ca3af",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
};

export function BadgeDrawer({ badge, onClose, className }: BadgeDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      className={cn(
        "tcm-fixed tcm-inset-0 tcm-z-50 tcm-flex tcm-items-end tcm-justify-center tcm-bg-black/60 tcm-backdrop-blur-sm tcm-animate-in tcm-fade-in tcm-duration-200",
        className,
      )}
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={drawerRef}
        className="tcm-relative tcm-w-full tcm-max-w-md tcm-rounded-t-2xl tcm-p-6 tcm-pb-10 tcm-animate-in tcm-slide-in-from-bottom tcm-duration-300"
        style={{ background: "var(--card)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="tcm-absolute tcm-top-4 tcm-right-4 tcm-w-8 tcm-h-8 tcm-rounded-full tcm-flex tcm-items-center tcm-justify-center tcm-hover:tcm-bg-muted tcm-transition-colors"
          aria-label="Close"
        >
          <X className="tcm-w-5 tcm-h-5 tcm-text-muted-foreground" />
        </button>

        {/* Badge content */}
        <div className="tcm-flex tcm-flex-col tcm-items-center tcm-text-center tcm-gap-4">
          {/* Large icon */}
          <div
            className="tcm-w-16 tcm-h-16 tcm-rounded-full tcm-flex tcm-items-center tcm-justify-center"
            style={{
              background: `${badge.color}1f`,
              border: `2px solid ${badge.color}40`,
            }}
          >
            <BadgeIcon
              name={badge.lucideIcon}
              style={{ color: badge.color }}
              className="tcm-w-8 tcm-h-8"
              strokeWidth={1.75}
            />
          </div>

          {/* Badge name */}
          <h2 className="tcm-text-xl tcm-font-bold tcm-text-foreground">{badge.name}</h2>

          {/* Description */}
          <p className="tcm-text-sm tcm-text-muted-foreground tcm-max-w-[280px]">
            {badge.description}
          </p>

          {/* Rarity pill */}
          <span
            className="tcm-text-xs tcm-font-semibold tcm-uppercase tcm-px-3 tcm-py-1 tcm-rounded-full"
            style={{
              background: RARITY_COLORS[badge.rarity],
              color: "white",
            }}
          >
            {badge.rarity}
          </span>
        </div>
      </div>
    </div>
  );
}
