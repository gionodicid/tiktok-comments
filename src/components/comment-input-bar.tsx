"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Smile, Image as ImageIcon, AtSign, ArrowUp, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StickerFetchParams } from "@/lib/comments-client";
import { CommentProfile, CommentUser, StickerItem, StickerPack } from "./comment-data";
import { StickerSelector } from "./sticker-selector";
import { MentionSelector } from "./mention-selector";
import { ImagePicker } from "./image-picker";

export interface Attachment {
  type: "image" | "sticker";
  url: string;
}

interface ReplyPreview {
  username: string;
  text: string;
}

interface CommentInputBarProps {
  replyingTo: ReplyPreview | null;
  onCancelReply: () => void;
  onSubmit: (text: string, attachment?: Attachment) => void;
  currentUser?: CommentUser;
  mentionUsers?: CommentProfile[];
  mentionUsersLoading?: boolean;
  onOpenMentions?: () => void;
  stickerPacks?: StickerPack[];
  stickers?: StickerItem[];
  stickersLoading?: boolean;
  onFetchStickers?: (params: StickerFetchParams) => void;
  onToggleStickerFavorite?: (id: string) => void;
  onOpenStickers?: () => void;
}

const MAX_CHARS = 2200;

export function CommentInputBar({
  replyingTo,
  onCancelReply,
  onSubmit,
  currentUser,
  mentionUsers,
  mentionUsersLoading,
  onOpenMentions,
  stickerPacks,
  stickers,
  stickersLoading,
  onFetchStickers,
  onToggleStickerFavorite,
  onOpenStickers,
}: CommentInputBarProps) {
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [stickerSelectorOpen, setStickerSelectorOpen] = useState(false);
  const [mentionSelectorOpen, setMentionSelectorOpen] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  const revokePreviewBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!replyingTo) return;
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    const id = window.setTimeout(() => textareaRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [replyingTo]);

  const openMentions = useCallback(() => {
    setStickerSelectorOpen(false);
    setImagePickerOpen(false);
    setMentionSelectorOpen(true);
    onOpenMentions?.();
  }, [onOpenMentions]);

  const toggleStickers = useCallback(() => {
    setMentionSelectorOpen(false);
    setImagePickerOpen(false);
    setStickerSelectorOpen((open) => {
      if (!open) onOpenStickers?.();
      return !open;
    });
  }, [onOpenStickers]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS);
    setText(val);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";

    if (val.endsWith("@") && !mentionSelectorOpen) {
      openMentions();
    }
  }, [mentionSelectorOpen, openMentions]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    onSubmit(trimmed, attachment || undefined);
    blobUrlRef.current = null;
    setText("");
    setAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, attachment, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        setStickerSelectorOpen(false);
        setMentionSelectorOpen(false);
        setImagePickerOpen(false);
      }
    },
    [handleSubmit]
  );

  const trackBlobUrl = useCallback(
    (url: string) => {
      revokePreviewBlob();
      if (url.startsWith("blob:")) blobUrlRef.current = url;
    },
    [revokePreviewBlob],
  );

  const handleImageClick = useCallback(() => {
    setStickerSelectorOpen(false);
    setMentionSelectorOpen(false);
    setImagePickerOpen((open) => !open);
  }, []);

  const handleImageSelect = useCallback(
    (url: string) => {
      trackBlobUrl(url);
      setAttachment({ type: "image", url });
    },
    [trackBlobUrl],
  );

  const handleStickerSelect = useCallback(
    (url: string) => {
      revokePreviewBlob();
      setAttachment({ type: "sticker", url });
    },
    [revokePreviewBlob],
  );

  const handleRemoveAttachment = useCallback(() => {
    revokePreviewBlob();
    setAttachment(null);
  }, [revokePreviewBlob]);

  const handleEditAttachment = useCallback(() => {
    setMentionSelectorOpen(false);
    if (attachment?.type === "sticker") {
      setImagePickerOpen(false);
      setStickerSelectorOpen(true);
      onOpenStickers?.();
      return;
    }
    setStickerSelectorOpen(false);
    setImagePickerOpen(true);
  }, [attachment?.type, onOpenStickers]);

  const handleMentionSelect = useCallback((name: string) => {
    setText((prev) => {
      if (prev.endsWith("@")) {
        return (prev.slice(0, -1) + `@${name} `).slice(0, MAX_CHARS);
      }
      return (prev + `@${name} `).slice(0, MAX_CHARS);
    });
    textareaRef.current?.focus();
  }, []);

  const handleInsertEmoji = useCallback((emoji: string) => {
    setText((prev) => (prev + emoji).slice(0, MAX_CHARS));
    textareaRef.current?.focus();
  }, []);

  const canSend = text.trim().length > 0 || attachment !== null;
  const charCount = text.length;

  const avatarUrl = currentUser?.avatar ?? "/placeholder.svg?height=36&width=36";

  return (
    <div
      ref={rootRef}
      className="tcm-relative tcm-border-t tcm-border-border"
      style={{ background: "var(--background)" }}
    >
      {/* Panels above input */}
      {stickerSelectorOpen && onFetchStickers && onToggleStickerFavorite && (
        <StickerSelector
          packs={stickerPacks ?? []}
          stickers={stickers ?? []}
          loading={stickersLoading}
          onSelect={handleStickerSelect}
          onClose={() => setStickerSelectorOpen(false)}
          onFetchStickers={onFetchStickers}
          onToggleFavorite={onToggleStickerFavorite}
        />
      )}
      {imagePickerOpen && (
        <ImagePicker
          onSelect={handleImageSelect}
          onClose={() => setImagePickerOpen(false)}
        />
      )}
      {mentionSelectorOpen && (
        <MentionSelector
          users={mentionUsers ?? []}
          loading={mentionUsersLoading}
          onSelect={handleMentionSelect}
          onInsertEmoji={handleInsertEmoji}
          onClose={() => setMentionSelectorOpen(false)}
        />
      )}

      {/* Reply context banner */}
      {replyingTo && (
        <div
          className="tcm-flex tcm-items-start tcm-justify-between tcm-gap-3 tcm-px-4 tcm-py-2 tcm-text-xs tcm-border-b tcm-border-border"
          style={{ color: "var(--muted-foreground)" }}
        >
          <div className="tcm-min-w-0 tcm-flex-1">
            <p>
              Replying to{" "}
              <span className="tcm-font-semibold" style={{ color: "var(--foreground)" }}>
                @{replyingTo.username}
              </span>
            </p>
            <p className="tcm-mt-0.5 tcm-line-clamp-2 tcm-break-words">
              {replyingTo.text}
            </p>
          </div>
          <button
            onClick={onCancelReply}
            className="tcm-shrink-0 tcm-font-semibold tcm-hover:tcm-text-foreground tcm-transition-colors"
            aria-label="Cancel reply"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="tcm-px-4 tcm-pt-3 tcm-pb-1">
          <div className="tcm-relative tcm-inline-block">
            <img
              src={attachment.url}
              alt={attachment.type === "image" ? "Image preview" : "Sticker preview"}
              className="tcm-rounded-lg tcm-object-cover tcm-w-20 tcm-h-20"
            />
            {/* Edit button */}
            <button
              type="button"
              onClick={handleEditAttachment}
              className="tcm-absolute tcm-top-1 tcm-left-1 tcm-w-6 tcm-h-6 tcm-rounded-full tcm-bg-black/70 tcm-flex tcm-items-center tcm-justify-center tcm-text-white tcm-hover:tcm-bg-black/90 tcm-transition-colors"
              aria-label="Edit attachment"
            >
              <Pencil size={12} />
            </button>
            {/* Remove button */}
            <button
              onClick={handleRemoveAttachment}
              className="tcm-absolute tcm-top-1 tcm-right-1 tcm-w-6 tcm-h-6 tcm-rounded-full tcm-bg-black/70 tcm-flex tcm-items-center tcm-justify-center tcm-text-white tcm-hover:tcm-bg-black/90 tcm-transition-colors"
              aria-label="Remove attachment"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="tcm-flex tcm-items-end tcm-gap-2.5 tcm-px-3 tcm-py-3">
        <div className="tcm-shrink-0">
          <img
            src={avatarUrl}
            alt="Your avatar"
            className="tcm-rounded-full tcm-object-cover tcm-w-9 tcm-h-9"
          />
        </div>

        <div
          className="tcm-flex-1 tcm-min-w-0 tcm-flex tcm-items-start tcm-rounded-2xl tcm-px-3 tcm-py-2 tcm-gap-1"
          style={{ background: "var(--input-surface)", minHeight: 60 }}
        >
          <div className="tcm-flex-1 tcm-min-w-0 tcm-flex tcm-flex-col">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={replyingTo ? `Reply to @${replyingTo.username}…` : "Add comment…"}
              className="tcm-w-full tcm-bg-transparent tcm-text-sm tcm-text-foreground tcm-placeholder:tcm-text-muted-foreground tcm-resize-none tcm-outline-none tcm-leading-relaxed tcm-overflow-y-auto"
              style={{ scrollbarWidth: "none", minHeight: 22, maxHeight: 160 }}
              aria-label="Comment input"
            />
            <span
              className="tcm-mt-1 tcm-text-[11px] tcm-self-start tcm-tabular-nums"
              style={{
                color: charCount >= MAX_CHARS * 0.9
                  ? "var(--love-red)"
                  : "var(--muted-foreground)",
              }}
            >
              {charCount}/{MAX_CHARS}
            </span>
          </div>
          <div className="tcm-flex tcm-items-center tcm-gap-0.5 tcm-shrink-0 tcm-mb-px">
            <PillIconButton
              icon={<ImageIcon size={19} />}
              label="Attach image"
              onClick={handleImageClick}
              active={imagePickerOpen}
            />
            <PillIconButton
              icon={<Smile size={19} />}
              label="Stickers"
              onClick={toggleStickers}
              active={stickerSelectorOpen}
            />
            <PillIconButton
              icon={<AtSign size={19} />}
              label="Mention"
              onClick={() => {
                if (mentionSelectorOpen) {
                  setMentionSelectorOpen(false);
                  return;
                }
                openMentions();
              }}
              active={mentionSelectorOpen}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send comment"
          className={cn(
            "tcm-flex tcm-shrink-0 tcm-w-9 tcm-h-9 tcm-rounded-full tcm-items-center tcm-justify-center tcm-transition-all tcm-duration-150",
            canSend
              ? "tcm-opacity-100 tcm-scale-100"
              : "tcm-opacity-40 tcm-scale-95 tcm-cursor-not-allowed"
          )}
          style={{ background: canSend ? "var(--love-red)" : "var(--muted)" }}
        >
          <ArrowUp size={16} className="tcm-text-white" />
        </button>
      </div>

      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  );
}

function PillIconButton({
  icon,
  label,
  className,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tcm-w-7 tcm-h-7 tcm-flex tcm-items-center tcm-justify-center tcm-rounded-full tcm-transition-colors",
        active && "tcm-bg-muted",
        className
      )}
      style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
      aria-label={label}
      aria-pressed={active}
      onMouseEnter={(e) => !active && (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={(e) => !active && (e.currentTarget.style.color = "var(--muted-foreground)")}
    >
      {icon}
    </button>
  );
}
