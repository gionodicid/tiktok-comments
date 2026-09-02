"use client";

import { useEffect, useCallback, useState } from "react";
import { X, Flag } from "lucide-react";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

interface StickerDrawerProps {
  src: string;
  onClose: () => void;
  onReport?: (src: string) => void;
}

function stickerFilename(src: string): string {
  try {
    const path = new URL(src, window.location.href).pathname;
    const tail = path.split("/").pop();
    if (tail && /\.[a-z0-9]+$/i.test(tail)) return tail;
  } catch {
    /* relative or invalid URL */
  }
  return "sticker.png";
}

export function StickerDrawer({ src, onClose, onReport }: StickerDrawerProps) {
  const [shareLabel, setShareLabel] = useState("Share");
  const [saving, setSaving] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useBodyScrollLock();

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url: src });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(src);
      setShareLabel("Copied!");
      window.setTimeout(() => setShareLabel("Share"), 2000);
    } catch {
      setShareLabel("Copy failed");
      window.setTimeout(() => setShareLabel("Share"), 2000);
    }
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = stickerFilename(src);
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="tcm-fixed tcm-inset-0 tcm-z-50 tcm-flex tcm-items-end tcm-justify-center tcm-bg-black/60 tcm-animate-in tcm-fade-in tcm-duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sticker drawer"
    >
      <div
        className="tcm-w-full tcm-max-w-lg tcm-rounded-t-2xl tcm-animate-in tcm-slide-in-from-bottom tcm-duration-300"
        style={{ background: "var(--card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tcm-flex tcm-items-center tcm-justify-between tcm-px-4 tcm-py-3 tcm-border-b tcm-border-border">
          <button
            type="button"
            onClick={() => onReport?.(src)}
            disabled={!onReport}
            aria-disabled={!onReport}
            className="tcm-w-9 tcm-h-9 tcm-rounded-full tcm-flex tcm-items-center tcm-justify-center tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-hover:tcm-bg-muted tcm-transition-colors tcm-disabled:tcm-opacity-40 tcm-disabled:tcm-pointer-events-none"
            aria-label="Report sticker"
          >
            <Flag size={18} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="tcm-w-9 tcm-h-9 tcm-rounded-full tcm-flex tcm-items-center tcm-justify-center tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="tcm-flex tcm-items-center tcm-justify-center tcm-py-8">
          <img
            src={src}
            alt="Sticker"
            className="tcm-object-contain tcm-w-[200px] tcm-h-[200px]"
          />
        </div>

        <div className="tcm-flex tcm-flex-col tcm-gap-2 tcm-px-4 tcm-pb-6">
          <button
            type="button"
            onClick={handleShare}
            className="tcm-w-full tcm-py-3 tcm-rounded-xl tcm-text-sm tcm-font-semibold tcm-text-foreground tcm-transition-colors"
            style={{ background: "var(--muted)" }}
          >
            {shareLabel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            aria-busy={saving}
            className="tcm-w-full tcm-py-3 tcm-rounded-xl tcm-text-sm tcm-font-bold tcm-text-white tcm-transition-colors tcm-disabled:tcm-opacity-60"
            style={{ background: "var(--love-red)" }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
      </div>
    </div>
  );
}
