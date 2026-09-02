"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Star, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StickerFetchParams } from "@/lib/comments-client";
import type { StickerItem, StickerPack } from "./comment-data";

const SEARCH_DEBOUNCE_MS = 300;

interface StickerSelectorProps {
  packs: StickerPack[];
  stickers: StickerItem[];
  loading?: boolean;
  onSelect: (stickerUrl: string) => void;
  onClose: () => void;
  onFetchStickers: (params: StickerFetchParams) => void;
  onToggleFavorite: (id: string) => void;
}

type ViewMode = "pack" | "favorites" | "emoji" | "search";

export function StickerSelector({
  packs,
  stickers,
  loading,
  onSelect,
  onClose,
  onFetchStickers,
  onToggleFavorite,
}: StickerSelectorProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mode, setMode] = useState<ViewMode>("pack");
  const [activePackId, setActivePackId] = useState("");
  const resolvedPackId = activePackId || (packs[0]?.id ?? "");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchQuery]);

  useEffect(() => {
    if (mode !== "search") return;
    onFetchStickers({ q: debouncedQuery || undefined, search: true });
  }, [mode, debouncedQuery, onFetchStickers]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleStickerClick = (url: string) => {
    onSelect(url);
    onClose();
  };

  const openSearch = () => {
    setMode("search");
    setSearchOpen(true);
  };

  const openFavorites = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setMode("favorites");
    onFetchStickers({ favorites: true });
  };

  const openEmoji = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setMode("emoji");
    onFetchStickers({ kind: "emoji" });
  };

  const openPack = (packId: string) => {
    setSearchOpen(false);
    setSearchQuery("");
    setDebouncedQuery("");
    setMode("pack");
    setActivePackId(packId);
    onFetchStickers({ pack: packId });
  };

  const sectionLabel =
    mode === "search"
      ? "Search results"
      : mode === "favorites"
        ? "Favorites"
        : mode === "emoji"
          ? "Emoji"
          : packs.find((p) => p.id === resolvedPackId)?.name ?? "Stickers";

  return (
    <div
      className="tcm-absolute tcm-bottom-full tcm-left-0 tcm-right-0 tcm-z-20 tcm-border-t tcm-border-border tcm-rounded-t-2xl tcm-animate-in tcm-slide-in-from-bottom-4 tcm-duration-200"
      style={{ background: "var(--card)", maxHeight: "50dvh" }}
    >
      <div
        className="tcm-flex tcm-items-center tcm-gap-1 tcm-px-3 tcm-py-2 tcm-border-b tcm-border-border tcm-overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <button
          type="button"
          onClick={openSearch}
          className={cn(
            "tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-transition-colors",
            mode === "search" ? "tcm-bg-muted tcm-text-foreground" : "tcm-text-muted-foreground tcm-hover:tcm-bg-muted",
          )}
          aria-label="Search stickers"
          aria-pressed={mode === "search"}
        >
          <Search size={18} />
        </button>
        <button
          type="button"
          onClick={openFavorites}
          className={cn(
            "tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-transition-colors",
            mode === "favorites" ? "tcm-bg-muted tcm-text-foreground" : "tcm-text-muted-foreground tcm-hover:tcm-bg-muted",
          )}
          aria-label="Favorites"
          aria-pressed={mode === "favorites"}
        >
          <Star size={18} />
        </button>
        <button
          type="button"
          onClick={openEmoji}
          className={cn(
            "tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-transition-colors",
            mode === "emoji" ? "tcm-bg-muted tcm-text-foreground" : "tcm-text-muted-foreground tcm-hover:tcm-bg-muted",
          )}
          aria-label="Emoji"
          aria-pressed={mode === "emoji"}
        >
          <Smile size={18} />
        </button>
        <div className="tcm-w-px tcm-h-5 tcm-bg-border tcm-mx-1" />
        {packs.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => openPack(pack.id)}
            className={cn(
              "tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-lg tcm-flex tcm-items-center tcm-justify-center tcm-text-lg tcm-transition-colors",
              mode === "pack" && resolvedPackId === pack.id
                ? "tcm-bg-muted"
                : "tcm-hover:tcm-bg-muted",
            )}
            aria-label={`${pack.name} pack`}
            aria-pressed={mode === "pack" && resolvedPackId === pack.id}
          >
            {pack.icon}
          </button>
        ))}
      </div>

      {searchOpen && (
        <div className="tcm-px-3 tcm-py-2 tcm-border-b tcm-border-border">
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search stickers…"
            className="tcm-w-full tcm-rounded-xl tcm-px-3 tcm-py-2 tcm-text-sm tcm-text-foreground tcm-placeholder:tcm-text-muted-foreground tcm-outline-none"
            style={{ background: "var(--input-surface)" }}
            aria-label="Search stickers"
          />
        </div>
      )}

      <div className="tcm-px-4 tcm-pt-3 tcm-pb-2">
        <span className="tcm-text-xs tcm-font-semibold tcm-text-muted-foreground tcm-uppercase tcm-tracking-wide">
          {sectionLabel}
        </span>
      </div>

      <div
        className="tcm-px-3 tcm-pb-4 tcm-overflow-y-auto"
        style={{ maxHeight: "calc(50dvh - 100px)" }}
      >
        {loading ? (
          <p className="tcm-py-6 tcm-text-sm tcm-text-center tcm-text-muted-foreground">Loading…</p>
        ) : stickers.length === 0 ? (
          <p className="tcm-py-6 tcm-text-sm tcm-text-center tcm-text-muted-foreground tcm-px-4">
            {mode === "favorites"
              ? "No favorites yet — tap the star on a sticker"
              : mode === "search" && debouncedQuery
                ? `No stickers match “${debouncedQuery}”`
                : "No stickers found"}
          </p>
        ) : (
          <div className="tcm-grid tcm-grid-cols-4 tcm-gap-2">
            {stickers.map((sticker) => (
              <div key={sticker.id} className="tcm-relative tcm-aspect-square">
                <button
                  type="button"
                  onClick={() => handleStickerClick(sticker.url)}
                  className="tcm-w-full tcm-h-full tcm-rounded-xl tcm-overflow-hidden tcm-hover:tcm-ring-2 tcm-hover:tcm-ring-ring tcm-transition-all"
                  aria-label={`Select ${sticker.label ?? "sticker"}`}
                >
                  <img
                    src={sticker.url}
                    alt={sticker.label ?? "Sticker"}
                    className="tcm-w-full tcm-h-full tcm-object-cover"
                  />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(sticker.id)}
                  className="tcm-absolute tcm-top-1 tcm-right-1 tcm-w-5 tcm-h-5 tcm-rounded-full tcm-flex tcm-items-center tcm-justify-center tcm-bg-black/50 tcm-hover:tcm-bg-black/70 tcm-transition-colors"
                  aria-label={sticker.favorited ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star
                    size={12}
                    className={cn(
                      sticker.favorited ? "tcm-fill-current tcm-text-amber-400" : "tcm-text-white",
                    )}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
