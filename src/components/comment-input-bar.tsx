"use client";

import { useState, useRef, useCallback } from "react";
import { Smile, Image as ImageIcon, AtSign, ArrowUp, X, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { CommentUser } from "./comment-data";
import { StickerSelector } from "./sticker-selector";
import { MentionSelector } from "./mention-selector";

export interface Attachment {
  type: "image" | "sticker";
  url: string;
}

interface CommentInputBarProps {
  replyingTo: string | null;
  onCancelReply: () => void;
  onSubmit: (text: string, attachment?: Attachment) => void;
  currentUser?: CommentUser;
}

const MAX_CHARS = 2200;

// Mock image for demo when clicking image icon
const MOCK_IMAGE_URL = "https://picsum.photos/400/300?random=99";

export function CommentInputBar({ replyingTo, onCancelReply, onSubmit, currentUser }: CommentInputBarProps) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [stickerSelectorOpen, setStickerSelectorOpen] = useState(false);
  const [mentionSelectorOpen, setMentionSelectorOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value.slice(0, MAX_CHARS);
    setText(val);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";

    // Check for @ trigger
    if (val.endsWith("@") && !mentionSelectorOpen) {
      setMentionSelectorOpen(true);
    }
  }, [mentionSelectorOpen]);

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !attachment) return;
    onSubmit(trimmed, attachment || undefined);
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
      }
    },
    [handleSubmit]
  );

  const handleImageClick = useCallback(() => {
    // For demo, attach a mock image
    setAttachment({ type: "image", url: MOCK_IMAGE_URL });
    setStickerSelectorOpen(false);
    setMentionSelectorOpen(false);
  }, []);

  const handleStickerSelect = useCallback((url: string) => {
    setAttachment({ type: "sticker", url });
  }, []);

  const handleMentionSelect = useCallback((username: string) => {
    setText((prev) => {
      // Replace trailing @ with @username
      if (prev.endsWith("@")) {
        return (prev.slice(0, -1) + `@${username} `).slice(0, MAX_CHARS);
      }
      return (prev + `@${username} `).slice(0, MAX_CHARS);
    });
    textareaRef.current?.focus();
  }, []);

  const canSend = text.trim().length > 0 || attachment !== null;
  const charCount = text.length;

  const avatarUrl = currentUser?.avatar ?? "/placeholder.svg?height=36&width=36";

  const closePanels = () => {
    setStickerSelectorOpen(false);
    setMentionSelectorOpen(false);
  };

  return (
    <div
      className="tcm:relative tcm:border-t tcm:border-border"
      style={{ background: "var(--background)" }}
    >
      {/* Panels above input */}
      {stickerSelectorOpen && (
        <StickerSelector
          onSelect={handleStickerSelect}
          onClose={() => setStickerSelectorOpen(false)}
        />
      )}
      {mentionSelectorOpen && (
        <MentionSelector
          onSelect={handleMentionSelect}
          onClose={() => setMentionSelectorOpen(false)}
        />
      )}

      {/* Reply context banner */}
      {replyingTo && (
        <div
          className="tcm:flex tcm:items-center tcm:justify-between tcm:px-4 tcm:py-2 tcm:text-xs tcm:border-b tcm:border-border"
          style={{ color: "var(--muted-foreground)" }}
        >
          <span>
            Replying to{" "}
            <span className="tcm:font-semibold" style={{ color: "var(--foreground)" }}>
              @{replyingTo}
            </span>
          </span>
          <button
            onClick={onCancelReply}
            className="tcm:font-semibold tcm:hover:tcm:text-foreground tcm:transition-colors"
            aria-label="Cancel reply"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="tcm:px-4 tcm:pt-3 tcm:pb-1">
          <div className="tcm:relative tcm:inline-block">
            <img
              src={attachment.url}
              alt={attachment.type === "image" ? "Image preview" : "Sticker preview"}
              className="tcm:rounded-lg tcm:object-cover tcm:w-20 tcm:h-20"
            />
            {/* Edit button */}
            <button
              className="tcm:absolute tcm:top-1 tcm:left-1 tcm:w-6 tcm:h-6 tcm:rounded-full tcm:bg-black/70 tcm:flex tcm:items-center tcm:justify-center tcm:text-white tcm:hover:tcm:bg-black/90 tcm:transition-colors"
              aria-label="Edit attachment"
            >
              <Pencil size={12} />
            </button>
            {/* Remove button */}
            <button
              onClick={() => setAttachment(null)}
              className="tcm:absolute tcm:top-1 tcm:right-1 tcm:w-6 tcm:h-6 tcm:rounded-full tcm:bg-black/70 tcm:flex tcm:items-center tcm:justify-center tcm:text-white tcm:hover:tcm:bg-black/90 tcm:transition-colors"
              aria-label="Remove attachment"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {focused ? (
        /* ── EXPANDED LAYOUT ── */
        <div className="tcm:flex tcm:flex-col">
          {/* Row 1 (emoji strip removed) */}

          {/* Row 2: avatar + full-width pill */}
          <div className="tcm:flex tcm:items-start tcm:gap-2.5 tcm:px-3 tcm:pt-3 tcm:pb-2">
          <div className="tcm:shrink-0 tcm:mt-1">
              <img
                src={avatarUrl}
                alt="Your avatar"
                className="tcm:rounded-full tcm:object-cover tcm:w-9 tcm:h-9"
              />
            </div>
            {/* Pill grows vertically; textarea scrolls after max-h */}
            <div
              className="tcm:flex-1 tcm:min-w-0 tcm:flex tcm:flex-col tcm:rounded-2xl tcm:px-4 tcm:pt-3 tcm:pb-2 tcm:ring-1 tcm:ring-ring"
              style={{ background: "var(--input-surface)" }}
            >
              <textarea
                ref={textareaRef}
                value={text}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  setFocused(true);
                  closePanels();
                }}
                onBlur={() => {
                  setTimeout(() => setFocused(false), 150);
                }}
                rows={1}
                placeholder={replyingTo ? `Reply to @${replyingTo}…` : "Add comment…"}
                className="tcm:w-full tcm:bg-transparent tcm:text-sm tcm:text-foreground tcm:placeholder:tcm:text-muted-foreground tcm:resize-none tcm:outline-none tcm:leading-relaxed tcm:overflow-y-auto"
                style={{ scrollbarWidth: "none", minHeight: 22, maxHeight: 160 }}
                aria-label="Comment input"
                autoFocus
              />
              {charCount > 0 && (
                <span
                  className="tcm:mt-1.5 tcm:text-[11px] tcm:self-start tcm:tabular-nums"
                  style={{
                    color: charCount >= MAX_CHARS * 0.9
                      ? "var(--love-red)"
                      : "var(--muted-foreground)",
                  }}
                >
                  {charCount}/{MAX_CHARS}
                </span>
              )}
            </div>
          </div>

          {/* Row 3: action icons left, send button right */}
          <div className="tcm:flex tcm:items-center tcm:justify-between tcm:px-3 tcm:pb-3">
            <div className="tcm:flex tcm:items-center tcm:gap-1">
              <ToolbarIconButton
                icon={<ImageIcon size={22} />}
                label="Attach image"
                onClick={handleImageClick}
              />
              <ToolbarIconButton
                icon={<Smile size={22} />}
                label="Stickers"
                onClick={() => {
                  setMentionSelectorOpen(false);
                  setStickerSelectorOpen((p) => !p);
                }}
                active={stickerSelectorOpen}
              />
              <ToolbarIconButton
                icon={<AtSign size={22} />}
                label="Mention"
                onClick={() => {
                  setStickerSelectorOpen(false);
                  setMentionSelectorOpen((p) => !p);
                }}
                active={mentionSelectorOpen}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSend}
              aria-label="Send comment"
              className={cn(
                "tcm:hidden tcm:lg:tcm:flex tcm:w-12 tcm:h-10 tcm:rounded-full tcm:items-center tcm:justify-center tcm:transition-all tcm:duration-150",
                canSend
                  ? "tcm:opacity-100 tcm:scale-100"
                  : "tcm:opacity-40 tcm:scale-95 tcm:cursor-not-allowed"
              )}
              style={{ background: canSend ? "var(--love-red)" : "var(--muted)" }}
            >
              <ArrowUp size={18} className="tcm:text-white" />
            </button>
          </div>
        </div>
      ) : (
        /* ── COLLAPSED LAYOUT ── */
        <div className="tcm:flex tcm:items-center tcm:gap-2.5 tcm:px-3 tcm:py-3">
          <div className="tcm:shrink-0">
            <img
              src={avatarUrl}
              alt="Your avatar"
              className="tcm:rounded-full tcm:object-cover tcm:w-9 tcm:h-9"
            />
          </div>

          <div
            className="tcm:flex-1 tcm:min-w-0 tcm:flex tcm:items-center tcm:rounded-full tcm:px-4 tcm:py-2 tcm:gap-2"
            style={{ background: "var(--input-surface)" }}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              rows={1}
              placeholder={replyingTo ? `Reply to @${replyingTo}…` : "Add comment…"}
              className="tcm:flex-1 tcm:bg-transparent tcm:text-sm tcm:text-foreground tcm:placeholder:tcm:text-muted-foreground tcm:resize-none tcm:outline-none tcm:leading-relaxed tcm:overflow-y-auto"
              style={{ scrollbarWidth: "none", minHeight: 22, maxHeight: 160 }}
              aria-label="Comment input"
            />
            <div className="tcm:flex tcm:items-center tcm:gap-0.5 tcm:shrink-0">
              <PillIconButton icon={<ImageIcon size={19} />} label="Attach image" onClick={handleImageClick} />
              <PillIconButton icon={<Smile size={19} />} label="Stickers" onClick={() => setStickerSelectorOpen(true)} />
              <PillIconButton icon={<AtSign size={19} />} label="Mention" onClick={() => setMentionSelectorOpen(true)} />
            </div>
          </div>

          {/* Send button — desktop only */}
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            aria-label="Send comment"
            className={cn(
              "tcm:hidden tcm:lg:tcm:flex tcm:shrink-0 tcm:w-9 tcm:h-9 tcm:rounded-full tcm:items-center tcm:justify-center tcm:transition-all tcm:duration-150",
              canSend
                ? "tcm:opacity-100 tcm:scale-100"
                : "tcm:opacity-40 tcm:scale-95 tcm:cursor-not-allowed"
            )}
            style={{ background: canSend ? "var(--love-red)" : "var(--muted)" }}
          >
            <ArrowUp size={16} className="tcm:text-white" />
          </button>
        </div>
      )}

      <div style={{ height: "env(safe-area-inset-bottom, 0px)" }} />
    </div>
  );
}

function PillIconButton({
  icon,
  label,
  className,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "tcm:w-7 tcm:h-7 tcm:flex tcm:items-center tcm:justify-center tcm:rounded-full tcm:transition-colors",
        className
      )}
      style={{ color: "var(--muted-foreground)" }}
      aria-label={label}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
    >
      {icon}
    </button>
  );
}

function ToolbarIconButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "tcm:w-10 tcm:h-10 tcm:flex tcm:items-center tcm:justify-center tcm:rounded-full tcm:transition-colors",
        active ? "tcm:bg-muted" : "tcm:hover:tcm:bg-muted"
      )}
      style={{ color: active ? "var(--foreground)" : "var(--muted-foreground)" }}
      aria-label={label}
      onMouseEnter={(e) => !active && (e.currentTarget.style.color = "var(--foreground)")}
      onMouseLeave={(e) => !active && (e.currentTarget.style.color = "var(--muted-foreground)")}
    >
      {icon}
    </button>
  );
}
