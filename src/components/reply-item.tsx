"use client";

import { useState } from "react";
import { Heart, ThumbsDown, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderMentions } from "@/lib/mention-parser";
import { formatCommentTime } from "@/lib/format-comment-time";
import { Reply, CommentProfile, formatLikes } from "./comment-data";
import { Lightbox } from "./lightbox";
import { StickerDrawer } from "./sticker-drawer";
import { ProfileDrawer } from "./profile-drawer";

interface ReplyItemProps {
  reply: Reply;
  hasLineBelow: boolean;
  mentionNames: string[];
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onReply: (name: string, replyId: string | undefined, text: string) => void;
  onMentionClick: (name: string) => Promise<CommentProfile | undefined>;
  onViewProfile?: (profile: CommentProfile) => void;
  onReportSticker?: (src: string) => void;
}

function ReplyItem({
  reply,
  hasLineBelow,
  mentionNames,
  onLike,
  onDislike,
  onReply,
  onMentionClick,
  onViewProfile,
  onReportSticker,
}: ReplyItemProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [stickerDrawerOpen, setStickerDrawerOpen] = useState(false);
  const [profileTarget, setProfileTarget] = useState<CommentProfile | null>(null);

  const openAuthorProfile = async () => {
    const user = await onMentionClick(reply.name);
    setProfileTarget(
      user ?? {
        name: reply.name,
        avatar: reply.avatar,
        subscription: reply.subscription,
      },
    );
  };

  const openMentionProfile = async (name: string) => {
    const user = await onMentionClick(name);
    if (user) setProfileTarget(user);
  };

  return (
    <div className="tcm-flex tcm-gap-3 tcm-pt-3 tcm-w-full tcm-min-w-0">
      {/*
        Left column — fixed 32px wide, stretches to full row height.
        Avatar sits at the top. When hasLineBelow, a 1px line fills the
        remaining space from the bottom of the avatar to the bottom of
        the row, creating a continuous rail into the next reply's avatar.
      */}
      <div
        className="tcm-flex tcm-flex-col tcm-items-center tcm-shrink-0 tcm-self-stretch tcm-w-8"
      >
        {/* Avatar (no corner badge) */}
        <button
          className="tcm-shrink-0"
          onClick={openAuthorProfile}
          aria-label={`View ${reply.name}'s profile`}
        >
          <img
            src={reply.avatar}
            alt={`${reply.name}'s avatar`}
            className="tcm-rounded-full tcm-object-cover tcm-w-6 tcm-h-6 tcm-md:tcm-w-8 tcm-md:tcm-h-8"
          />
        </button>

        {/*
          Thread line — fills remaining height of this row only (flex-1).
          A 4px gap top and bottom keeps it from touching either avatar.
          This creates the disconnected [Profile] ----- [Profile] appearance.
        */}
        {hasLineBelow && (
          <div
            className="tcm-flex-1"
            style={{
              width: 1.5,
              background: "linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.03))",
              marginTop: 6,
              marginBottom: 6,
              borderRadius: "6px 6px 9999px 9999px",
            }}
            aria-hidden
          />
        )}
      </div>

      {/* Text content */}
      <div className="tcm-flex-1 tcm-min-w-0 tcm-pb-3">
        {/* username [PRO] > replyingTo (NO badge icons in replies) */}
        <div className="tcm-flex tcm-items-center tcm-gap-1.5 tcm-flex-wrap tcm-mb-0.5">
          <span className="tcm-text-[13px] tcm-font-semibold tcm-leading-tight tcm-text-foreground">
            {reply.name}
          </span>
          {/* Subscription pill — always after username, before replyingTo */}
          {reply.subscription && (
            <span
              className="tcm-text-[9px] tcm-font-bold tcm-px-1 tcm-py-px tcm-rounded-sm tcm-uppercase"
              style={{
                color: reply.subscription === "max" ? "#a855f7" : "#f59e0b",
                border: `1px solid ${reply.subscription === "max" ? "#7c3aed" : "#b45309"}`,
                background: "transparent",
              }}
            >
              {reply.subscription}
            </span>
          )}
          {reply.replyingTo && (
            <>
              <span
                className="tcm-text-[10px] tcm-leading-none"
                style={{ color: "var(--muted-foreground)" }}
                aria-hidden
              >
                &#9654;
              </span>
              <span
                className="tcm-text-[13px] tcm-leading-tight"
                style={{ color: "var(--muted-foreground)" }}
              >
                {reply.replyingTo}
              </span>
            </>
          )}
        </div>

        {/* Reply body */}
        <p className="tcm-text-[15px] tcm-text-foreground tcm-leading-snug tcm-break-words">
          {renderMentions(reply.text, {
            names: mentionNames,
            onMentionClick: openMentionProfile,
          })}
        </p>

        {/* Image attachment */}
        {reply.image && (
          <button
            onClick={() => setLightboxOpen(true)}
            className="tcm-mt-2 tcm-rounded-lg tcm-overflow-hidden tcm-block tcm-hover:tcm-opacity-90 tcm-transition-opacity"
            aria-label="View full image"
          >
            <img
              src={reply.image}
              alt="Attached image"
              className="tcm-object-cover tcm-rounded-lg tcm-w-[100px] tcm-h-[75px]"
            />
          </button>
        )}

        {/* Sticker attachment */}
        {reply.sticker && (
          <button
            onClick={() => setStickerDrawerOpen(true)}
            className="tcm-mt-2 tcm-block tcm-hover:tcm-scale-105 tcm-transition-transform"
            aria-label="View sticker"
          >
            <img
              src={reply.sticker}
              alt="Sticker"
              className="tcm-object-contain tcm-w-16 tcm-h-16"
            />
          </button>
        )}

        {/* Metadata row: timestamp > Reply > [spacer] > heart > dislike */}
        <div className="tcm-flex tcm-items-center tcm-gap-3 tcm-mt-2">
          <span className="tcm-text-[13px] tcm-text-muted-foreground tcm-tabular-nums">
            {formatCommentTime(reply.timestamp)}
          </span>
          <button
            className="tcm-text-[13px] tcm-font-semibold tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-transition-colors"
            onClick={() => onReply(reply.name, reply.id, reply.text)}
            aria-label={`Reply to ${reply.name}`}
          >
            Reply
          </button>
          <div className="tcm-ml-auto tcm-flex tcm-items-center tcm-gap-3">
            <button
              onClick={() => onLike(reply.id)}
              aria-label={reply.liked ? "Unlike" : "Like"}
              className="tcm-flex tcm-items-center tcm-gap-1.5 tcm-transition-transform tcm-active:tcm-scale-125"
            >
              <Heart
                className={cn(
                  "tcm-w-[1em] tcm-h-[1em] tcm-transition-colors",
                  reply.liked
                    ? "tcm-fill-current tcm-stroke-none"
                    : "tcm-fill-none tcm-stroke-muted-foreground tcm-hover:tcm-stroke-foreground"
                )}
                style={reply.liked ? { color: "var(--love-red)" } : undefined}
                strokeWidth={1.75}
              />
              <span className="tcm-text-[11px] tcm-text-muted-foreground tcm-tabular-nums tcm-min-w-[20px]">
                {formatLikes(reply.likes)}
              </span>
            </button>
            <button
              onClick={() => onDislike(reply.id)}
              aria-label={reply.disliked ? "Remove dislike" : "Dislike reply"}
            >
              <ThumbsDown
                className={cn(
                  "tcm-w-[1em] tcm-h-[1em] tcm-transition-colors",
                  reply.disliked
                    ? "tcm-fill-current tcm-stroke-none tcm-text-foreground"
                    : "tcm-fill-none tcm-stroke-muted-foreground tcm-hover:tcm-stroke-foreground",
                )}
                strokeWidth={1.75}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox for image */}
      {lightboxOpen && reply.image && (
        <Lightbox
          src={reply.image}
          alt="Reply image"
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Sticker drawer */}
      {stickerDrawerOpen && reply.sticker && (
        <StickerDrawer
          src={reply.sticker}
          onClose={() => setStickerDrawerOpen(false)}
          onReport={onReportSticker}
        />
      )}

      {/* Profile drawer */}
      {profileTarget && (
        <ProfileDrawer
          profile={profileTarget}
          onClose={() => setProfileTarget(null)}
          onViewProfile={onViewProfile}
        />
      )}
    </div>
  );
}

interface ReplyListProps {
  replies: Reply[];
  expandReplies?: boolean;
  mentionNames: string[];
  onLikeReply: (replyId: string) => void;
  onDislikeReply: (replyId: string) => void;
  onReply: (username: string, replyId: string | undefined, text: string) => void;
  onMentionClick: (name: string) => Promise<CommentProfile | undefined>;
  onViewProfile?: (profile: CommentProfile) => void;
  onReportSticker?: (src: string) => void;
}

export function ReplyList({
  replies,
  expandReplies,
  mentionNames,
  onLikeReply,
  onDislikeReply,
  onReply,
  onMentionClick,
  onViewProfile,
  onReportSticker,
}: ReplyListProps) {
  const [expanded, setExpanded] = useState(false);
  if (replies.length === 0) return null;

  // Always show first reply; rest revealed on expand. Search can force-expand.
  const showAll = expandReplies || expanded;
  const visible = showAll ? replies : replies.slice(0, 1);
  const hiddenCount = replies.length - 1;

  return (
    <div className="tcm-mb-2">
      {visible.map((r, i) => (
        <ReplyItem
          key={r.id}
          reply={r}
          /*
            Draw a line below this reply only if the next reply is also visible.
            i.e. not the last visible item.
          */
          hasLineBelow={i < visible.length - 1}
          mentionNames={mentionNames}
          onLike={onLikeReply}
          onDislike={onDislikeReply}
          onReply={onReply}
          onMentionClick={onMentionClick}
          onViewProfile={onViewProfile}
          onReportSticker={onReportSticker}
        />
      ))}

      {/*
        Footer row — only when hidden replies exist:
          collapsed: ── View X more v
          expanded:  ── View X more v  [spacer]  Hide ^
        The short dash is always on the far left.
        "Hide" is always on the far right.
      */}
      {hiddenCount > 0 && !expandReplies && (
        <div className="tcm-flex tcm-items-center tcm-gap-2 tcm-pt-0.5 tcm-pb-2">
          {/* Short leading dash ── */}
          <div
            className="tcm-shrink-0"
            style={{
              width: 20,
              height: 1.5,
              background: "var(--muted-foreground)",
              opacity: 0.5,
            }}
            aria-hidden
          />

          {!expanded ? (
            <button
              className="tcm-flex tcm-items-center tcm-gap-1 tcm-text-[13px] tcm-font-semibold tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-transition-colors tcm-whitespace-nowrap"
              onClick={() => setExpanded(true)}
            >
              View {hiddenCount} more <ChevronDown className="tcm-w-[13px] tcm-h-[13px]" />
            </button>
          ) : (
            <button
              className="tcm-flex tcm-items-center tcm-gap-1 tcm-text-[13px] tcm-font-semibold tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-transition-colors tcm-whitespace-nowrap"
              onClick={() => setExpanded(false)}
            >
              Hide <ChevronUp className="tcm-w-[13px] tcm-h-[13px]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
