"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listUrl,
  replaceComment,
  requestJson,
  resolveCommentSectionEndpoints,
  stickersUrl,
  type CommentApiPayload,
  type CommentSectionEndpointsConfig,
  type CommentSort,
  type StickerFetchParams,
} from "@/lib/comments-client";
import { Comment, CommentProfile, CommentUser, StickerItem, StickerPack } from "./comment-data";
import { CommentItem } from "./comment-item";
import { CommentInputBar, Attachment } from "./comment-input-bar";

export type {
  CommentApiPayload,
  CommentSectionEndpoints,
  CommentSectionEndpointsConfig,
  CommentSort,
  StickerFetchParams,
} from "@/lib/comments-client";

export interface ReplyTarget {
  commentId: string;
  replyId?: string;
  username: string;
  text: string;
}

export interface CommentSectionProps {
  /** Comments resource, e.g. `/api/comments`. */
  url: string;
  /** Maps any server JSON into the library payload. */
  response: (raw: unknown) => CommentApiPayload;
  /**
   * Optional per-route overrides. Unset keys default from `url`:
   * list/submit → `url`; like → `{url}/{id}/like`; users → `{url}/users`; etc.
   */
  endpoints?: CommentSectionEndpointsConfig;
  className?: string;
  theme?: "dark" | "light";
  /** Show theme toggle beside search. Default `false`. */
  showThemeToggle?: boolean;
  /** Called when the user toggles theme (controlled mode with `theme`). */
  onThemeChange?: (theme: "dark" | "light") => void;
  /** Host navigation when View profile is tapped (overrides `profile.profileUrl`). */
  onViewProfile?: (profile: CommentProfile) => void;
  /** Host moderation when a posted sticker is reported. */
  onReportSticker?: (src: string) => void;
}

function replyMatchesQuery(comment: Comment, query: string): boolean {
  const q = query.toLowerCase();
  return comment.replies.some(
    (r) => r.text.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
  );
}

function collectMentionNames(comments: Comment[], currentUser?: CommentUser): string[] {
  const names = new Set<string>();
  if (currentUser?.name) names.add(currentUser.name);
  for (const comment of comments) {
    names.add(comment.name);
    for (const reply of comment.replies) names.add(reply.name);
  }
  return [...names];
}

const SEARCH_DEBOUNCE_MS = 300;

export function CommentSection({
  url,
  response,
  endpoints: endpointsConfig,
  className,
  theme = "dark",
  showThemeToggle = false,
  onThemeChange,
  onViewProfile,
  onReportSticker,
}: CommentSectionProps) {
  const apiEndpoints = useMemo(
    () => resolveCommentSectionEndpoints(url, endpointsConfig),
    [url, endpointsConfig],
  );
  const [internalTheme, setInternalTheme] = useState(theme);
  const activeTheme = onThemeChange ? theme : internalTheme;

  const handleThemeToggle = () => {
    const next = activeTheme === "dark" ? "light" : "dark";
    if (onThemeChange) onThemeChange(next);
    else setInternalTheme(next);
  };
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<CommentUser>();
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [activeTab, setActiveTab] = useState<CommentSort>("top");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<CommentProfile[]>([]);
  const [mentionUsersLoading, setMentionUsersLoading] = useState(false);
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([]);
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [stickersLoading, setStickersLoading] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const applyList = useCallback((payload: CommentApiPayload, append: boolean) => {
    const page = payload.comments ?? [];
    setComments((prev) => (append ? [...prev, ...page] : page));
    setHasMore(Boolean(payload.hasMore));
    setTotalCount(payload.totalCount ?? 0);
    if (payload.currentUser) setCurrentUser(payload.currentUser);
  }, []);

  const fetchList = useCallback(
    async (offset: number, append: boolean) => {
      const raw = await requestJson(
        listUrl(apiEndpoints.list, { q: debouncedQuery, sort: activeTab, offset }),
      );
      applyList(response(raw), append);
    },
    [apiEndpoints.list, debouncedQuery, activeTab, applyList, response],
  );

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load comments from url
    fetchList(0, false)
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchList]);

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      await fetchList(comments.length, true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setIsLoadingMore(false);
    }
  }, [comments.length, fetchList]);

  const handleLike = useCallback(
    async (id: string) => {
      const raw = await requestJson(apiEndpoints.likeComment(id), { method: "POST" });
      const { comment } = response(raw);
      if (comment) setComments((prev) => replaceComment(prev, comment));
    },
    [apiEndpoints, response],
  );

  const handleLikeReply = useCallback(
    async (commentId: string, replyId: string) => {
      const raw = await requestJson(apiEndpoints.likeReply(commentId, replyId), {
        method: "POST",
      });
      const { comment } = response(raw);
      if (comment) setComments((prev) => replaceComment(prev, comment));
    },
    [apiEndpoints, response],
  );

  const handleDislike = useCallback(
    async (id: string) => {
      const raw = await requestJson(apiEndpoints.dislikeComment(id), { method: "POST" });
      const { comment } = response(raw);
      if (comment) setComments((prev) => replaceComment(prev, comment));
    },
    [apiEndpoints, response],
  );

  const handleDislikeReply = useCallback(
    async (commentId: string, replyId: string) => {
      const raw = await requestJson(apiEndpoints.dislikeReply(commentId, replyId), {
        method: "POST",
      });
      const { comment } = response(raw);
      if (comment) setComments((prev) => replaceComment(prev, comment));
    },
    [apiEndpoints, response],
  );

  const handleMentionClick = useCallback(
    async (name: string): Promise<CommentProfile | undefined> => {
      try {
        const raw = await requestJson(apiEndpoints.userByName(name));
        return response(raw).user;
      } catch {
        return undefined;
      }
    },
    [apiEndpoints, response],
  );

  const handleOpenMentions = useCallback(async () => {
    if (mentionUsers.length > 0 || mentionUsersLoading) return;
    setMentionUsersLoading(true);
    try {
      const raw = await requestJson(apiEndpoints.users);
      setMentionUsers(response(raw).users ?? []);
    } catch {
      setMentionUsers([]);
    } finally {
      setMentionUsersLoading(false);
    }
  }, [mentionUsers.length, mentionUsersLoading, apiEndpoints.users, response]);

  const fetchStickers = useCallback(
    async (params: StickerFetchParams) => {
      setStickersLoading(true);
      try {
        const raw = await requestJson(stickersUrl(apiEndpoints.stickers, params));
        const payload = response(raw);
        if (payload.packs) setStickerPacks(payload.packs);
        setStickers(payload.stickers ?? []);
      } catch {
        setStickers([]);
      } finally {
        setStickersLoading(false);
      }
    },
    [apiEndpoints.stickers, response],
  );

  const handleOpenStickers = useCallback(() => {
    fetchStickers({});
  }, [fetchStickers]);

  const handleToggleStickerFavorite = useCallback(
    async (id: string) => {
      try {
        const raw = await requestJson(apiEndpoints.stickerFavorite(id), { method: "POST" });
        const { sticker } = response(raw);
        if (sticker) {
          setStickers((prev) => prev.map((s) => (s.id === id ? sticker : s)));
        }
      } catch {
        /* ignore */
      }
    },
    [apiEndpoints, response],
  );

  const mentionNames = useMemo(() => {
    const names = new Set(collectMentionNames(comments, currentUser));
    for (const user of mentionUsers) names.add(user.name);
    return [...names];
  }, [comments, currentUser, mentionUsers]);

  const handleSubmit = useCallback(
    async (text: string, attachment?: Attachment) => {
      const raw = await requestJson(apiEndpoints.submit, {
        method: "POST",
        body: JSON.stringify({ text, attachment, replyTo: replyTarget ?? undefined }),
      });
      const { comment } = response(raw);
      if (comment) {
        setComments((prev) => replaceComment(prev, comment));
        setTotalCount((n) => n + 1);
      }
      setReplyTarget(null);
    },
    [apiEndpoints.submit, replyTarget, response],
  );

  const handleRetry = useCallback(() => {
    setLoading(true);
    fetchList(0, false)
      .then(() => setError(null))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => setLoading(false));
  }, [fetchList]);

  return (
    <div
      className={cn(
        "tcm-root tcm-flex tcm-flex-col tcm-h-full tcm-min-h-0 tcm-flex-1 tcm-w-full tcm-overflow-hidden tcm-font-sans tcm-antialiased",
        activeTheme === "dark" && "dark",
        className,
      )}
      data-theme={activeTheme}
      style={{ background: "var(--background)" }}
    >
      {error ? (
        <div className="tcm-flex tcm-flex-1 tcm-flex-col tcm-items-center tcm-justify-center tcm-gap-3 tcm-text-muted-foreground">
          <p className="tcm-text-sm">{error}</p>
          <button
            type="button"
            className="tcm-text-sm tcm-font-semibold tcm-text-foreground tcm-underline"
            onClick={handleRetry}
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="tcm-flex tcm-flex-1 tcm-items-center tcm-justify-center tcm-text-sm tcm-text-muted-foreground">
          Loading comments…
        </div>
      ) : (
        <>
          <header
            className="tcm-shrink-0 tcm-border-b tcm-border-border tcm-px-3 tcm-sm:tcm-px-4 tcm-pt-3 tcm-sm:tcm-pt-4 tcm-pb-0"
            style={{ background: "var(--background)" }}
          >
            <div className="tcm-flex tcm-items-center tcm-justify-between tcm-mb-3">
              <h2 className="tcm-text-base tcm-font-bold tcm-text-foreground">
                {totalCount.toLocaleString()} comments
              </h2>
              <div className="tcm-flex tcm-items-center tcm-gap-2">
                {showThemeToggle && (
                  <button
                    type="button"
                    onClick={handleThemeToggle}
                    className="tcm-text-xs tcm-font-semibold tcm-px-3 tcm-py-1.5 tcm-rounded-full tcm-border tcm-border-border tcm-text-foreground tcm-bg-card"
                  >
                    Theme: {activeTheme}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (searchOpen) {
                      setSearchQuery("");
                      setDebouncedQuery("");
                      setSearchOpen(false);
                    } else {
                      setSearchOpen(true);
                    }
                  }}
                  className="tcm-w-8 tcm-h-8 tcm-flex tcm-items-center tcm-justify-center tcm-rounded-full tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-hover:tcm-bg-muted tcm-transition-colors"
                  aria-label={searchOpen ? "Close search" : "Search comments"}
                >
                  {searchOpen ? <X size={18} /> : <Search size={18} />}
                </button>
              </div>
            </div>
            {searchOpen && (
              <div className="tcm-flex tcm-items-center tcm-gap-2 tcm-bg-input tcm-rounded-xl tcm-px-3 tcm-py-2 tcm-mb-3">
                <Search size={14} className="tcm-text-muted-foreground tcm-shrink-0" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search comments…"
                  className="tcm-flex-1 tcm-bg-transparent tcm-text-sm tcm-text-foreground tcm-placeholder:tcm-text-muted-foreground tcm-outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setDebouncedQuery("");
                    }}
                    aria-label="Clear search"
                  >
                    <X size={14} className="tcm-text-muted-foreground tcm-hover:tcm-text-foreground" />
                  </button>
                )}
              </div>
            )}
            {!searchOpen && (
              <div className="tcm-flex tcm-gap-1">
                {(["top", "recent"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`tcm-px-4 tcm-py-2 tcm-text-sm tcm-font-semibold tcm-capitalize tcm-rounded-t-lg tcm-transition-colors tcm-border-b-2 ${
                      activeTab === tab
                        ? "tcm-border-foreground tcm-text-foreground"
                        : "tcm-border-transparent tcm-text-muted-foreground tcm-hover:tcm-text-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            )}
          </header>
          <main
            className="tcm-flex-1 tcm-min-h-0 tcm-overflow-y-auto tcm-pb-2 tcm-no-scrollbar"
            aria-label="Comments list"
          >
            {comments.length === 0 ? (
              <div className="tcm-flex tcm-flex-col tcm-items-center tcm-justify-center tcm-py-20 tcm-text-muted-foreground tcm-gap-2">
                <Search size={32} className="tcm-opacity-30" />
                <p className="tcm-text-sm">No comments found</p>
              </div>
            ) : (
              <ul>
                {comments.map((comment) => (
                  <li key={comment.id} className="tcm-border-b tcm-border-border/40 tcm-last:tcm-border-0">
                    <CommentItem
                      comment={comment}
                      expandReplies={
                        Boolean(debouncedQuery) && replyMatchesQuery(comment, debouncedQuery)
                      }
                      mentionNames={mentionNames}
                      onLike={handleLike}
                      onDislike={handleDislike}
                      onLikeReply={handleLikeReply}
                      onDislikeReply={handleDislikeReply}
                      onReply={(username, replyId, text) =>
                        setReplyTarget({ commentId: comment.id, replyId, username, text })
                      }
                      onMentionClick={handleMentionClick}
                      onViewProfile={onViewProfile}
                      onReportSticker={onReportSticker}
                    />
                  </li>
                ))}
              </ul>
            )}
            {hasMore && comments.length > 0 && (
              <div className="tcm-flex tcm-justify-center tcm-py-3">
                <button
                  type="button"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="tcm-text-sm tcm-font-semibold tcm-text-muted-foreground tcm-hover:tcm-text-foreground tcm-transition-colors tcm-disabled:tcm-opacity-50"
                >
                  {isLoadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </main>
          <div className="tcm-shrink-0">
            <CommentInputBar
              replyingTo={replyTarget}
              onCancelReply={() => setReplyTarget(null)}
              onSubmit={handleSubmit}
              currentUser={currentUser}
              mentionUsers={mentionUsers}
              mentionUsersLoading={mentionUsersLoading}
              onOpenMentions={handleOpenMentions}
              stickerPacks={stickerPacks}
              stickers={stickers}
              stickersLoading={stickersLoading}
              onFetchStickers={fetchStickers}
              onToggleStickerFavorite={handleToggleStickerFavorite}
              onOpenStickers={handleOpenStickers}
            />
          </div>
        </>
      )}
    </div>
  );
}
