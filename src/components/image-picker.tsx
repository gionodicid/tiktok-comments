"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Link, Images } from "lucide-react";
import { cn } from "@/lib/utils";

const STOCK_IMAGES = Array.from({ length: 8 }, (_, i) => ({
  id: `stock-${i}`,
  url: `https://picsum.photos/400/300?random=${i + 1}`,
}));

type ImageSource = "device" | "url" | "stock";

interface ImagePickerProps {
  onSelect: (url: string) => void;
  onClose: () => void;
}

function isAllowedImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function ImagePicker({ onSelect, onClose }: ImagePickerProps) {
  const [source, setSource] = useState<ImageSource>("stock");
  const [urlValue, setUrlValue] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const pick = (url: string) => {
    onSelect(url);
    onClose();
  };

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    pick(URL.createObjectURL(file));
  };

  const handleUrlAdd = () => {
    const trimmed = urlValue.trim();
    if (!isAllowedImageUrl(trimmed)) {
      setUrlError("Enter an http(s) or site-relative image URL");
      return;
    }
    setUrlError(null);
    pick(trimmed);
  };

  return (
    <div
      className="tcm-absolute tcm-bottom-full tcm-left-0 tcm-right-0 tcm-z-20 tcm-border-t tcm-border-border tcm-rounded-t-2xl tcm-animate-in tcm-slide-in-from-bottom-4 tcm-duration-200"
      style={{ background: "var(--card)", maxHeight: "50dvh" }}
    >
      <div
        className="tcm-flex tcm-items-center tcm-gap-1 tcm-px-3 tcm-py-2 tcm-border-b tcm-border-border"
        style={{ scrollbarWidth: "none" }}
      >
        {(
          [
            { id: "device", label: "Device", icon: ImageIcon },
            { id: "url", label: "URL", icon: Link },
            { id: "stock", label: "Stock", icon: Images },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setSource(id);
              setUrlError(null);
              if (id === "device") fileRef.current?.click();
            }}
            className={cn(
              "tcm-shrink-0 tcm-h-9 tcm-px-3 tcm-rounded-lg tcm-flex tcm-items-center tcm-gap-1.5 tcm-text-xs tcm-font-semibold tcm-transition-colors",
              source === id
                ? "tcm-bg-muted tcm-text-foreground"
                : "tcm-text-muted-foreground tcm-hover:tcm-bg-muted tcm-hover:tcm-text-foreground",
            )}
            aria-pressed={source === id}
            aria-label={label}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="tcm-hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {source === "device" && (
        <div className="tcm-px-4 tcm-py-6 tcm-flex tcm-flex-col tcm-items-center tcm-gap-3">
          <p className="tcm-text-sm tcm-text-muted-foreground">Choose a photo from this device</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="tcm-px-4 tcm-py-2 tcm-rounded-xl tcm-text-sm tcm-font-semibold tcm-text-foreground tcm-bg-muted tcm-hover:tcm-opacity-90 tcm-transition-opacity"
          >
            Browse
          </button>
        </div>
      )}

      {source === "url" && (
        <div className="tcm-px-4 tcm-py-4 tcm-flex tcm-flex-col tcm-gap-2">
          <label className="tcm-text-xs tcm-font-semibold tcm-text-muted-foreground tcm-uppercase tcm-tracking-wide">
            Image URL
          </label>
          <div className="tcm-flex tcm-gap-2">
            <input
              value={urlValue}
              onChange={(e) => {
                setUrlValue(e.target.value);
                setUrlError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleUrlAdd();
                }
              }}
              placeholder="https://…"
              className="tcm-flex-1 tcm-min-w-0 tcm-rounded-xl tcm-px-3 tcm-py-2 tcm-text-sm tcm-text-foreground tcm-placeholder:tcm-text-muted-foreground tcm-outline-none"
              style={{ background: "var(--input-surface)" }}
              aria-label="Image URL"
            />
            <button
              type="button"
              onClick={handleUrlAdd}
              className="tcm-shrink-0 tcm-px-4 tcm-py-2 tcm-rounded-xl tcm-text-sm tcm-font-semibold tcm-text-foreground tcm-bg-muted tcm-hover:tcm-opacity-90 tcm-transition-opacity"
            >
              Add
            </button>
          </div>
          {urlError && (
            <p className="tcm-text-xs" style={{ color: "var(--love-red)" }}>
              {urlError}
            </p>
          )}
        </div>
      )}

      {source === "stock" && (
        <div
          className="tcm-px-3 tcm-py-3 tcm-overflow-y-auto"
          style={{ maxHeight: "calc(50dvh - 56px)" }}
        >
          <div className="tcm-grid tcm-grid-cols-4 tcm-gap-2">
            {STOCK_IMAGES.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => pick(image.url)}
                className="tcm-aspect-square tcm-rounded-xl tcm-overflow-hidden tcm-hover:tcm-ring-2 tcm-hover:tcm-ring-ring tcm-transition-all"
                aria-label="Select stock image"
              >
                <img
                  src={image.url}
                  alt="Stock image"
                  className="tcm-w-full tcm-h-full tcm-object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
