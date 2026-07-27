"use client";

import { useEffect, useCallback } from "react";
import { X, Flag } from "lucide-react";

interface StickerDrawerProps {
  src: string;
  onClose: () => void;
}

export function StickerDrawer({ src, onClose }: StickerDrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "tcm:hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <div
      className="tcm:fixed tcm:inset-0 tcm:z-50 tcm:flex tcm:items-end tcm:justify-center tcm:bg-black/60 tcm:animate-in tcm:fade-in tcm:duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sticker drawer"
    >
      {/* Drawer panel */}
      <div
        className="tcm:w-full tcm:max-w-lg tcm:rounded-t-2xl tcm:animate-in tcm:slide-in-from-bottom tcm:duration-300"
        style={{ background: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header row */}
        <div className="tcm:flex tcm:items-center tcm:justify-between tcm:px-4 tcm:py-3 tcm:border-b tcm:border-border">
          <button
            className="tcm:w-9 tcm:h-9 tcm:rounded-full tcm:flex tcm:items-center tcm:justify-center tcm:text-muted-foreground tcm:hover:tcm:text-foreground tcm:hover:tcm:bg-muted tcm:transition-colors"
            aria-label="Report sticker"
          >
            <Flag size={18} />
          </button>
          <button
            onClick={onClose}
            className="tcm:w-9 tcm:h-9 tcm:rounded-full tcm:flex tcm:items-center tcm:justify-center tcm:text-muted-foreground tcm:hover:tcm:text-foreground tcm:hover:tcm:bg-muted tcm:transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sticker display */}
        <div className="tcm:flex tcm:items-center tcm:justify-center tcm:py-8">
          <img
            src={src}
            alt="Sticker"
            className="tcm:object-contain tcm:w-[200px] tcm:h-[200px]"
          />
        </div>

        {/* Action buttons */}
        <div className="tcm:flex tcm:flex-col tcm:gap-2 tcm:px-4 tcm:pb-6">
          <button
            className="tcm:w-full tcm:py-3 tcm:rounded-xl tcm:text-sm tcm:font-semibold tcm:text-foreground tcm:transition-colors"
            style={{ background: "var(--muted)" }}
          >
            Share
          </button>
          <button
            className="tcm:w-full tcm:py-3 tcm:rounded-xl tcm:text-sm tcm:font-bold tcm:text-white tcm:transition-colors"
            style={{ background: "var(--love-red)" }}
          >
            Save
          </button>
        </div>

        {/* Safe area */}
        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
}
