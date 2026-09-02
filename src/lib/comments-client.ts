import type {
  Comment,
  CommentProfile,
  CommentUser,
  StickerPack,
  StickerItem,
} from "../components/comment-data";

export const PAGE_SIZE = 5;

export interface CommentApiPayload {
  comments?: Comment[];
  totalCount?: number;
  hasMore?: boolean;
  currentUser?: CommentUser;
  comment?: Comment;
  user?: CommentProfile;
  users?: CommentProfile[];
  stickers?: StickerItem[];
  packs?: StickerPack[];
  sticker?: StickerItem;
}

export interface StickerFetchParams {
  pack?: string;
  q?: string;
  favorites?: boolean;
  kind?: "sticker" | "emoji";
  /** Search tab: browse/filter the full catalog, not just the default pack. */
  search?: boolean;
}

export type CommentSort = "top" | "recent";

/** Resolved API paths for `CommentSection`. Override via partial `endpoints` prop. */
export interface CommentSectionEndpoints {
  /** GET list (`q`, `sort`, `offset`, `limit`). Default: `url`. */
  list: string;
  /** POST comment/reply. Default: `url`. */
  submit: string;
  likeComment: (commentId: string) => string;
  dislikeComment: (commentId: string) => string;
  likeReply: (commentId: string, replyId: string) => string;
  dislikeReply: (commentId: string, replyId: string) => string;
  /** GET mention directory. Default: `{url}/users`. */
  users: string;
  /** GET profile by display name. Default: `{url}/users?name=`. */
  userByName: (name: string) => string;
  /** GET sticker catalog (query appended). Default: `{url}/stickers`. */
  stickers: string;
  stickerFavorite: (stickerId: string) => string;
}

export type CommentSectionEndpointsConfig = Partial<CommentSectionEndpoints>;

export function defaultCommentSectionEndpoints(baseUrl: string): CommentSectionEndpoints {
  return {
    list: baseUrl,
    submit: baseUrl,
    likeComment: (commentId) => `${baseUrl}/${commentId}/like`,
    dislikeComment: (commentId) => `${baseUrl}/${commentId}/dislike`,
    likeReply: (commentId, replyId) => `${baseUrl}/${commentId}/replies/${replyId}/like`,
    dislikeReply: (commentId, replyId) => `${baseUrl}/${commentId}/replies/${replyId}/dislike`,
    users: `${baseUrl}/users`,
    userByName: (name) => `${baseUrl}/users?name=${encodeURIComponent(name)}`,
    stickers: `${baseUrl}/stickers`,
    stickerFavorite: (stickerId) => `${baseUrl}/stickers/${stickerId}/favorite`,
  };
}

export function resolveCommentSectionEndpoints(
  baseUrl: string,
  overrides?: CommentSectionEndpointsConfig,
): CommentSectionEndpoints {
  const defaults = defaultCommentSectionEndpoints(baseUrl);
  return {
    list: overrides?.list ?? defaults.list,
    submit: overrides?.submit ?? defaults.submit,
    likeComment: overrides?.likeComment ?? defaults.likeComment,
    dislikeComment: overrides?.dislikeComment ?? defaults.dislikeComment,
    likeReply: overrides?.likeReply ?? defaults.likeReply,
    dislikeReply: overrides?.dislikeReply ?? defaults.dislikeReply,
    users: overrides?.users ?? defaults.users,
    userByName: overrides?.userByName ?? defaults.userByName,
    stickers: overrides?.stickers ?? defaults.stickers,
    stickerFavorite: overrides?.stickerFavorite ?? defaults.stickerFavorite,
  };
}

export async function requestJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<unknown>;
}

export function listUrl(
  base: string,
  params: { q: string; sort: CommentSort; offset: number },
): string {
  const search = new URLSearchParams({
    q: params.q,
    sort: params.sort,
    offset: String(params.offset),
    limit: String(PAGE_SIZE),
  });
  const joiner = base.includes("?") ? "&" : "?";
  return `${base}${joiner}${search.toString()}`;
}

export function stickersUrl(base: string, params: StickerFetchParams): string {
  const search = new URLSearchParams();
  if (params.pack) search.set("pack", params.pack);
  if (params.q) search.set("q", params.q);
  if (params.favorites) search.set("favorites", "1");
  if (params.kind) search.set("kind", params.kind);
  if (params.search) search.set("search", "1");
  const qs = search.toString();
  return qs ? `${base}/stickers?${qs}` : `${base}/stickers`;
}

export function replaceComment(list: Comment[], comment: Comment): Comment[] {
  const index = list.findIndex((c) => c.id === comment.id);
  if (index === -1) return [comment, ...list];
  const next = [...list];
  next[index] = comment;
  return next;
}
