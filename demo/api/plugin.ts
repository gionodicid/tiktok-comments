import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type { Attachment } from "../../src/components/comment-input-bar";
import type { Comment, CommentProfile, Reply } from "../../src/components/comment-data";
import type { ReplyTarget } from "../../src/components/comment-section";
import { matchesQuery, sortComments, totalItems, type CommentSort } from "./query";
import { DEMO_USER, seedComments } from "./seed";
import {
  filterStickers,
  seedStickerCatalog,
  withFavorited,
  type StickerQuery,
} from "./stickers";

const API_PREFIX = "/api";

type Store = {
  comments: Comment[];
  stickerPacks: ReturnType<typeof seedStickerCatalog>["packs"];
  stickerCatalog: ReturnType<typeof seedStickerCatalog>["stickers"];
  favoriteStickerIds: Set<string>;
};

const globalStore = globalThis as typeof globalThis & { __demoCommentStore?: Store };

function getStore(): Store {
  if (!globalStore.__demoCommentStore) {
    const { packs, stickers } = seedStickerCatalog();
    globalStore.__demoCommentStore = {
      comments: seedComments(),
      stickerPacks: packs,
      stickerCatalog: stickers,
      favoriteStickerIds: new Set(),
    };
  }
  return globalStore.__demoCommentStore;
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  return JSON.parse(raw) as unknown;
}

type VoteItem = { id: string; liked: boolean; disliked?: boolean; likes: number };

function toggleLike<T extends VoteItem>(item: T): T {
  if (item.liked) {
    return { ...item, liked: false, likes: Math.max(0, item.likes - 1) };
  }
  return { ...item, liked: true, disliked: false, likes: item.likes + 1 };
}

function toggleDislike<T extends VoteItem>(item: T): T {
  if (item.disliked) {
    return { ...item, disliked: false };
  }
  return {
    ...item,
    disliked: true,
    liked: false,
    likes: item.liked ? Math.max(0, item.likes - 1) : item.likes,
  };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mangaReadForName(name: string): number {
  return (hashString(name.toLowerCase()) % 496) + 5;
}

function userActivityStats(
  name: string,
  comments: Comment[],
): { aura: number; commentCount: number; mangaReadCount: number } {
  const key = name.toLowerCase();
  let commentCount = 0;
  let aura = 0;
  for (const comment of comments) {
    if (comment.name.toLowerCase() === key) {
      commentCount += 1;
      aura += comment.likes;
    }
    for (const reply of comment.replies) {
      if (reply.name.toLowerCase() === key) {
        commentCount += 1;
        aura += reply.likes;
      }
    }
  }
  return {
    aura,
    commentCount,
    mangaReadCount: mangaReadForName(name),
  };
}

function rankByAura(comments: Comment[], names: string[]): Map<string, number> {
  const ranked = names
    .map((name) => ({ key: name.toLowerCase(), aura: userActivityStats(name, comments).aura }))
    .sort((a, b) => b.aura - a.aura);
  const ranks = new Map<string, number>();
  ranked.forEach((entry, index) => ranks.set(entry.key, index + 1));
  return ranks;
}

function enrichProfile(profile: CommentProfile, comments: Comment[], ranks: Map<string, number>): CommentProfile {
  const stats = userActivityStats(profile.name, comments);
  const rank = ranks.get(profile.name.toLowerCase());
  return {
    ...profile,
    aura: stats.aura,
    commentCount: stats.commentCount,
    mangaReadCount: stats.mangaReadCount,
    rank,
    profileUrl: `https://shinigami.io/users/${encodeURIComponent(profile.name)}`,
  };
}

function userDirectory(comments: Comment[]): CommentProfile[] {
  const byName = new Map<string, CommentProfile>();
  const add = (profile: CommentProfile) => {
    const key = profile.name.toLowerCase();
    if (!byName.has(key)) byName.set(key, profile);
  };
  add({ name: DEMO_USER.name, avatar: DEMO_USER.avatar });
  for (const comment of comments) {
    add({
      name: comment.name,
      avatar: comment.avatar,
      subscription: comment.subscription,
      badges: comment.badges,
    });
    for (const reply of comment.replies) {
      add({
        name: reply.name,
        avatar: reply.avatar,
        subscription: reply.subscription,
      });
    }
  }
  return [...byName.values()];
}

function enrichedUserDirectory(comments: Comment[]): CommentProfile[] {
  const directory = userDirectory(comments);
  const ranks = rankByAura(comments, directory.map((u) => u.name));
  return directory.map((profile) => enrichProfile(profile, comments, ranks));
}

export function commentsApiPlugin(): Plugin {
  return {
    name: "demo-comments-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? "";
        if (!url.startsWith(API_PREFIX)) {
          next();
          return;
        }

        const parsed = new URL(url, "http://localhost");
        const path = parsed.pathname;
        const method = req.method ?? "GET";
        const store = getStore();

        try {
          if (method === "GET" && path === "/api/me") {
            sendJson(res, 200, DEMO_USER);
            return;
          }

          if (method === "GET" && path === "/api/comments/users") {
            const directory = enrichedUserDirectory(store.comments);
            const name = parsed.searchParams.get("name")?.trim() ?? "";
            if (!name) {
              sendJson(res, 200, { users: directory });
              return;
            }
            const user = directory.find(
              (u) => u.name.toLowerCase() === name.toLowerCase(),
            );
            if (!user) {
              sendJson(res, 404, { error: "user not found" });
              return;
            }
            sendJson(res, 200, { user });
            return;
          }

          if (method === "GET" && path === "/api/comments/stickers") {
            const pack = parsed.searchParams.get("pack")?.trim() || undefined;
            const q = parsed.searchParams.get("q")?.trim() || undefined;
            const favorites = parsed.searchParams.get("favorites") === "1";
            const kindParam = parsed.searchParams.get("kind");
            const kind =
              kindParam === "emoji" || kindParam === "sticker" ? kindParam : undefined;
            const search = parsed.searchParams.get("search") === "1";
            const query: StickerQuery = { pack, q, favorites, kind, search };
            const stickers = filterStickers(
              store.stickerCatalog,
              store.stickerPacks,
              store.favoriteStickerIds,
              query,
            );
            sendJson(res, 200, { stickers, packs: store.stickerPacks });
            return;
          }

          const favoriteSticker = path.match(/^\/api\/comments\/stickers\/([^/]+)\/favorite$/);
          if (method === "POST" && favoriteSticker) {
            const id = decodeURIComponent(favoriteSticker[1]);
            const exists = store.stickerCatalog.some((s) => s.id === id);
            if (!exists) {
              sendJson(res, 404, { error: "sticker not found" });
              return;
            }
            if (store.favoriteStickerIds.has(id)) {
              store.favoriteStickerIds.delete(id);
            } else {
              store.favoriteStickerIds.add(id);
            }
            const sticker = withFavorited(store.stickerCatalog, store.favoriteStickerIds, id);
            sendJson(res, 200, { sticker });
            return;
          }

          if (method === "GET" && path === "/api/comments") {
            const q = parsed.searchParams.get("q")?.trim() ?? "";
            const sort: CommentSort =
              parsed.searchParams.get("sort") === "recent" ? "recent" : "top";
            const offset = Math.max(0, Number(parsed.searchParams.get("offset") ?? 0) || 0);
            const limit = Math.min(50, Math.max(1, Number(parsed.searchParams.get("limit") ?? 5) || 5));
            const matched = q ? store.comments.filter((c) => matchesQuery(c, q)) : store.comments;
            const sorted = sortComments(matched, sort);
            const page = sorted.slice(offset, offset + limit);
            sendJson(res, 200, {
              comments: page,
              totalCount: totalItems(matched),
              hasMore: offset + limit < sorted.length,
              currentUser: DEMO_USER,
              offset,
              limit,
            });
            return;
          }

          if (method === "POST" && path === "/api/comments") {
            const body = (await readJson(req)) as {
              text?: string;
              attachment?: Attachment;
              replyTo?: ReplyTarget;
            };
            const text = body.text?.trim() ?? "";
            const attachment = body.attachment;
            const replyTo = body.replyTo;
            const now = new Date().toISOString();

            if (!text && !attachment) {
              sendJson(res, 400, { error: "text or attachment required" });
              return;
            }

            if (replyTo) {
              const parent = store.comments.find((c) => c.id === replyTo.commentId);
              if (!parent) {
                sendJson(res, 404, { error: "comment not found" });
                return;
              }
              const reply: Reply = {
                id: crypto.randomUUID(),
                name: DEMO_USER.name,
                avatar: DEMO_USER.avatar,
                text,
                likes: 0,
                liked: false,
                disliked: false,
                timestamp: now,
                replyingTo: replyTo.username,
                image: attachment?.type === "image" ? attachment.url : undefined,
                sticker: attachment?.type === "sticker" ? attachment.url : undefined,
              };
              store.comments = store.comments.map((c) =>
                c.id === replyTo.commentId ? { ...c, replies: [...c.replies, reply] } : c,
              );
              const updated = store.comments.find((c) => c.id === replyTo.commentId);
              sendJson(res, 201, { comment: updated });
              return;
            }
            const comment: Comment = {
              id: crypto.randomUUID(),
              name: DEMO_USER.name,
              avatar: DEMO_USER.avatar,
              text,
              likes: 0,
              liked: false,
              disliked: false,
              timestamp: now,
              replies: [],
              image: attachment?.type === "image" ? attachment.url : undefined,
              sticker: attachment?.type === "sticker" ? attachment.url : undefined,
            };
            store.comments = [comment, ...store.comments];
            sendJson(res, 201, { comment });
            return;
          }

          const likeComment = path.match(/^\/api\/comments\/([^/]+)\/like$/);
          if (method === "POST" && likeComment) {
            const id = decodeURIComponent(likeComment[1]);
            const found = store.comments.some((c) => c.id === id);
            if (!found) {
              sendJson(res, 404, { error: "comment not found" });
              return;
            }
            store.comments = store.comments.map((c) => (c.id === id ? toggleLike(c) : c));
            sendJson(res, 200, { comment: store.comments.find((c) => c.id === id) });
            return;
          }

          const likeReply = path.match(/^\/api\/comments\/([^/]+)\/replies\/([^/]+)\/like$/);
          if (method === "POST" && likeReply) {
            const commentId = decodeURIComponent(likeReply[1]);
            const replyId = decodeURIComponent(likeReply[2]);
            const parent = store.comments.find((c) => c.id === commentId);
            if (!parent || !parent.replies.some((r) => r.id === replyId)) {
              sendJson(res, 404, { error: "reply not found" });
              return;
            }
            store.comments = store.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: c.replies.map((r) => (r.id === replyId ? toggleLike(r) : r)) }
                : c,
            );
            sendJson(res, 200, { comment: store.comments.find((c) => c.id === commentId) });
            return;
          }

          const dislikeComment = path.match(/^\/api\/comments\/([^/]+)\/dislike$/);
          if (method === "POST" && dislikeComment) {
            const id = decodeURIComponent(dislikeComment[1]);
            const found = store.comments.some((c) => c.id === id);
            if (!found) {
              sendJson(res, 404, { error: "comment not found" });
              return;
            }
            store.comments = store.comments.map((c) => (c.id === id ? toggleDislike(c) : c));
            sendJson(res, 200, { comment: store.comments.find((c) => c.id === id) });
            return;
          }

          const dislikeReply = path.match(/^\/api\/comments\/([^/]+)\/replies\/([^/]+)\/dislike$/);
          if (method === "POST" && dislikeReply) {
            const commentId = decodeURIComponent(dislikeReply[1]);
            const replyId = decodeURIComponent(dislikeReply[2]);
            const parent = store.comments.find((c) => c.id === commentId);
            if (!parent || !parent.replies.some((r) => r.id === replyId)) {
              sendJson(res, 404, { error: "reply not found" });
              return;
            }
            store.comments = store.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: c.replies.map((r) => (r.id === replyId ? toggleDislike(r) : r)) }
                : c,
            );
            sendJson(res, 200, { comment: store.comments.find((c) => c.id === commentId) });
            return;
          }

          sendJson(res, 404, { error: "not found" });
        } catch (err) {
          const message = err instanceof Error ? err.message : "server error";
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
