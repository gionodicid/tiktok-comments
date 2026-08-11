"use client";

import { useEffect, useCallback } from "react";
import { Search, Star, Smile } from "lucide-react";

interface StickerSelectorProps {
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
}

const PACK_ICONS = ["🐱", "👾", "🎭", "🤖", "🎃"];

const MOCK_STICKERS = Array.from({ length: 8 }, (_, i) => ({
  id: `sticker-${i}`,
  url: `https://picsum.photos/80/80?random=${i + 20}`,
}));

export function StickerSelector({ onSelect, onClose }: StickerSelectorProps) {
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

  const handleStickerClick = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <div
      className="tcm-absolute tcm-bottom-full tcm-left-0 tcm-right-0 tcm-z-20 tcm-border-t tcm-border-border tcm-rounded-t-2xl tcm-animate-in tcm-slide-in-from-bottom-4 tcm-duration-200"
      style={{ background: "var(--card)", maxHeight: "50vh" }}
    >
      {/* Header row with pack icons */}
      <div className="tcm-flex tcm-items-center tcm-gap-1 tcm-px-3 tcm-py-2 tcm-border-b tcm-border-border tcm-overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <button
          className="tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-text-muted-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
          aria-label="Search stickers"
        >
          <Search size={18} />
        </button>
        <button
          className="tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-text-muted-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
          aria-label="Favorites"
        >
          <Star size={18} />
        </button>
        <button
          className="tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-text-muted-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
          aria-label="Emoji"
        >
          <Smile size={18} />
        </button>
        <div className="tcm-w-px tcm-h-5 tcm-bg-border tcm-mx-1" />
        {PACK_ICONS.map((icon, i) => (
          <button
            key={i}
            className="tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-text-lg tcm-hover:tcm-bg-muted tcm-transition-colors"
            aria-label={`Sticker pack ${i + 1}`}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Section label */}
      <div className="tcm-px-4 tcm-pt-3 tcm-pb-2">
        <span className="tcm-text-xs tcm-font-semibold tcm-text-muted-foreground tcm-uppercase tcm-tracking-wide">
          Favorites
        </span>
      </div>

      {/* Sticker grid */}
      <div
        className="tcm-px-3 tcm-pb-4 tcm-overflow-y-auto"
        style={{ maxHeight: "calc(50vh - 100px)" }}
      >
        <div className="tcm-grid tcm-grid-cols-4 tcm-gap-2">
          {MOCK_STICKERS.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleStickerClick(sticker.url)}
              className="tcm-aspect-square tcm-rounded-xl tcm-overflow-hidden tcm-hover:tcm-ring-2 tcm-hover:tcm-ring-ring tcm-transition-all"
              aria-label="Select sticker"
            >
              <img
                src={sticker.url}
                alt="Sticker"
                className="tcm-w-full tcm-h-full tcm-object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
