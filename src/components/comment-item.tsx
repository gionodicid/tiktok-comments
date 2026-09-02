"use client";

import { useState } from "react";
import { Heart, ThumbsDown, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { renderMentions } from "@/lib/mention-parser";
import { formatCommentTime } from "@/lib/format-comment-time";
import { Comment, CommentProfile, formatLikes, BADGE_CATALOG, EarnedBadge } from "./comment-data";
import { ReplyList } from "./reply-item";
import { Lightbox } from "./lightbox";
import { StickerDrawer } from "./sticker-drawer";
import { BadgeDrawer } from "./badge-drawer";
import { BadgeIcon } from "./badge-icon";
import { ProfileDrawer } from "./profile-drawer";

const RARITY_ORDER: EarnedBadge["rarity"][] = ["legendary", "epic", "rare", "common"];

interface CommentItemProps {
  comment: Comment;
  expandReplies?: boolean;
  mentionNames: string[];
  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onLikeReply: (commentId: string, replyId: string) => void;
  onDislikeReply: (commentId: string, replyId: string) => void;
  onReply: (name: string, replyId: string | undefined, text: string) => void;
  onMentionClick: (name: string) => Promise<CommentProfile | undefined>;
  onViewProfile?: (profile: CommentProfile) => void;
  onReportSticker?: (src: string) => void;
}

export function CommentItem({
  comment,
  expandReplies,
  mentionNames,
  onLike,
  onDislike,
  onLikeReply,
  onDislikeReply,
  onReply,
  onMentionClick,
  onViewProfile,
  onReportSticker,
}: CommentItemProps) {
  const hasReplies = comment.replies.length > 0;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [stickerDrawerOpen, setStickerDrawerOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<EarnedBadge | null>(null);
  const [profileTarget, setProfileTarget] = useState<CommentProfile | null>(null);

  const openAuthorProfile = async () => {
    const user = await onMentionClick(comment.name);
    setProfileTarget(
      user ?? {
        name: comment.name,
        avatar: comment.avatar,
        subscription: comment.subscription,
        badges: comment.badges,
      },
    );
  };

  const openMentionProfile = async (name: string) => {
    const user = await onMentionClick(name);
    if (user) setProfileTarget(user);
  };

  const earnedBadges = (comment.badges || [])
    .map((id) => BADGE_CATALOG.find((b) => b.id === id))
    .filter((b): b is EarnedBadge => b !== undefined)
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity))
    .slice(0, 3);

  return (
    <article className="tcm-px-3 tcm-sm:tcm-px-4 tcm-pt-4 tcm-pb-1 tcm-w-full tcm-min-w-0">
      <div className="tcm-flex tcm-gap-3">

        {/* Avatar */}
        <button
          className="tcm-shrink-0 tcm-self-start"
          onClick={openAuthorProfile}
          aria-label={`View ${comment.name}'s profile`}
        >
          <img
            src={comment.avatar}
            alt={`${comment.name}'s avatar`}
            className="tcm-rounded-full tcm-object-cover tcm-w-8 tcm-h-8 tcm-md:tcm-w-10 tcm-md:tcm-h-10"
          />
        </button>

        {/* Right column */}
        <div className="tcm-flex-1 tcm-min-w-0">
          <div className="tcm-pb-3">

            {/* Name row: pin icon (if pinned) + username + badge icons + subscription pill */}
            <div className="tcm-flex tcm-items-center tcm-gap-1.5 tcm-flex-wrap tcm-mb-1">
              {comment.pinned && (
                <Pin
                  size={12}
                  style={{ color: "#666672" }}
                  aria-label="Pinned comment"
                />
              )}
              <span className="tcm-text-[13px] tcm-font-semibold tcm-leading-tight tcm-text-foreground">
                {comment.name}
              </span>

              {earnedBadges.length > 0 && (
                <div className="tcm-flex tcm-items-center tcm-gap-1">
                  {earnedBadges.map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge)}
                      className="tcm-w-[22px] tcm-h-[22px] tcm-rounded-full tcm-flex tcm-items-center tcm-justify-center tcm-transition-all tcm-hover:tcm-brightness-125 tcm-hover:tcm--translate-y-px"
                      style={{
                        background: `${badge.color}1f`,
                        border: `1px solid ${badge.color}40`,
                      }}
                      aria-label={`${badge.name} badge`}
                    >
                      <BadgeIcon
                        name={badge.lucideIcon}
                        style={{ color: badge.color }}
                        className="tcm-w-3 tcm-h-3"
                        strokeWidth={2}
                      />
                    </button>
                  ))}
                </div>
              )}

              {comment.subscription && (
                <span
                  className="tcm-text-[10px] tcm-font-bold tcm-px-1.5 tcm-py-0.5 tcm-rounded-sm tcm-uppercase"
                  style={{
                    color: comment.subscription === "max" ? "#a855f7" : "#f59e0b",
                    border: `1px solid ${comment.subscription === "max" ? "#7c3aed" : "#b45309"}`,
                    background: "transparent",
                  }}
                >
                  {comment.subscription}
                </span>
              )}
            </div>

            <p className="tcm-text-[15px] tcm-text-foreground tcm-leading-snug tcm-break-words">
              {renderMentions(comment.text, {
                names: mentionNames,
                onMentionClick: openMentionProfile,
              })}
            </p>

            {comment.image && (
              <button
                onClick={() => setLightboxOpen(true)}
                className="tcm-mt-2 tcm-rounded-lg tcm-overflow-hidden tcm-block tcm-hover:tcm-opacity-90 tcm-transition-opacity"
                aria-label="View full image"
              >
                <img
                  src={comment.image}
                  alt="Attached image"
                  className="tcm-object-cover tcm-rounded-lg tcm-w-[120px] tcm-h-[90px]"
                />
              </button>
            )}

            {comment.sticker && (
              <button
                onClick={() => setStickerDrawerOpen(true)}
                className="tcm-mt-2 tcm-block tcm-hover:tcm-scale-105 tcm-transition-transform"
                aria-label="View sticker"
              >
                <img
                  src={comment.sticker}
                  alt="Sticker"
                  className="tcm-object-contain tcm-w-20 tcm-h-20"
                />
              </button>
            )}

            <div className="tcm-flex tcm-items-center tcm-gap-3 tcm-mt-2">
              <span className="tcm-text-[13px] tcm-text-muted-foreground tcm-tabular-nums">
                {formatCommentTime(comment.timestamp)}
              </span>
              <button
                className="tcm-text-[13px] tcm-font-semibold tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-transition-colors"
                onClick={() => onReply(comment.name, undefined, comment.text)}
                aria-label={`Reply to ${comment.name}`}
              >
                Reply
              </button>
              <div className="tcm-ml-auto tcm-flex tcm-items-center tcm-gap-3">
                <button
                  onClick={() => onLike(comment.id)}
                  aria-label={comment.liked ? "Unlike comment" : "Like comment"}
                  className="tcm-flex tcm-items-center tcm-gap-1.5 tcm-transition-transform tcm-active:tcm-scale-125"
                >
                  <Heart
                    className={cn(
                      "tcm-w-[1em] tcm-h-[1em] tcm-transition-colors",
                      comment.liked
                        ? "tcm-fill-current tcm-stroke-none"
                        : "tcm-fill-none tcm-stroke-muted-foreground tcm-hover:tcm-stroke-foreground"
                    )}
                    style={comment.liked ? { color: "var(--love-red)" } : undefined}
                    strokeWidth={1.75}
                  />
                  <span className="tcm-text-[12px] tcm-text-muted-foreground tcm-tabular-nums tcm-min-w-[24px]">
                    {formatLikes(comment.likes)}
                  </span>
                </button>
                <button
                  onClick={() => onDislike(comment.id)}
                  aria-label={comment.disliked ? "Remove dislike" : "Dislike comment"}
                >
                  <ThumbsDown
                    className={cn(
                      "tcm-w-[1em] tcm-h-[1em] tcm-transition-colors",
                      comment.disliked
                        ? "tcm-fill-current tcm-stroke-none tcm-text-foreground"
                        : "tcm-fill-none tcm-stroke-muted-foreground tcm-hover:tcm-stroke-foreground",
                    )}
                    strokeWidth={1.75}
                  />
                </button>
              </div>
            </div>
          </div>

          {hasReplies && (
            <ReplyList
              replies={comment.replies}
              expandReplies={expandReplies}
              mentionNames={mentionNames}
              onLikeReply={(replyId) => onLikeReply(comment.id, replyId)}
              onDislikeReply={(replyId) => onDislikeReply(comment.id, replyId)}
              onReply={onReply}
              onMentionClick={onMentionClick}
              onViewProfile={onViewProfile}
              onReportSticker={onReportSticker}
            />
          )}
        </div>
      </div>

      {lightboxOpen && comment.image && (
        <Lightbox src={comment.image} alt="Comment image" onClose={() => setLightboxOpen(false)} />
      )}
      {stickerDrawerOpen && comment.sticker && (
        <StickerDrawer
          src={comment.sticker}
          onClose={() => setStickerDrawerOpen(false)}
          onReport={onReportSticker}
        />
      )}
      {selectedBadge && (
        <BadgeDrawer badge={selectedBadge} onClose={() => setSelectedBadge(null)} />
      )}
      {profileTarget && (
        <ProfileDrawer
          profile={profileTarget}
          onClose={() => setProfileTarget(null)}
          onViewProfile={onViewProfile}
        />
      )}
    </article>
  );
}
