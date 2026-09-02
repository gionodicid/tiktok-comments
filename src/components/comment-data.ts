export type SubscriptionTier = "pro" | "max";

export interface CommentUser {
  name: string;
  avatar: string;
}

export interface CommentProfile extends CommentUser {
  subscription?: SubscriptionTier;
  badges?: string[];
  /** Net score (e.g. likes minus downvotes on the user's comments). */
  aura?: number;
  commentCount?: number;
  mangaReadCount?: number;
  /** Leaderboard position (1 = top). */
  rank?: number;
  /** When set, View profile opens this URL (new tab). */
  profileUrl?: string;
}

export interface EarnedBadge {
  id: string;
  lucideIcon: string;
  color: string;
  name: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const BADGE_CATALOG: EarnedBadge[] = [
  { id: "yapper",  lucideIcon: "MessageCircle", color: "#fb923c", name: "Yapper",        description: "Posted 1000+ comments",               rarity: "epic"      },
  { id: "mystic",  lucideIcon: "Sparkles",      color: "#38bdf8", name: "Mystic",        description: "Predicted a viral trend",              rarity: "legendary" },
  { id: "early",   lucideIcon: "Rocket",         color: "#86efac", name: "Early Adopter", description: "Joined in the first week",             rarity: "rare"      },
  { id: "veteran", lucideIcon: "Shield",         color: "#fcd34d", name: "Veteran",       description: "Active for 1+ year",                  rarity: "epic"      },
  { id: "critic",  lucideIcon: "Swords",         color: "#f87171", name: "Critic",        description: "Won 50 debates",                       rarity: "epic"      },
  { id: "oracle",  lucideIcon: "Eye",            color: "#c4b5fd", name: "Oracle",        description: "Made 100 accurate predictions",        rarity: "legendary" },
  { id: "scout",   lucideIcon: "Binoculars",     color: "#34d399", name: "Scout",         description: "Discovered 10 new creators early",    rarity: "rare"      },
  { id: "manhwa",  lucideIcon: "BookOpen",       color: "#93c5fd", name: "Manhwa",        description: "Top commenter on webtoon content",    rarity: "common"    },
];

export interface StickerPack {
  id: string;
  icon: string;
  name: string;
}

export interface StickerItem {
  id: string;
  url: string;
  packId: string;
  kind: "sticker" | "emoji";
  label?: string;
  favorited?: boolean;
}

export interface Reply {
  id: string;
  name: string;
  avatar: string;
  text: string;
  likes: number;
  liked: boolean;
  disliked?: boolean;
  /** ISO 8601 UTC instant. The library formats this for display. */
  timestamp: string;
  replyingTo?: string;
  image?: string;
  sticker?: string;
  subscription?: SubscriptionTier;
}

export interface Comment {
  id: string;
  name: string;
  avatar: string;
  text: string;
  likes: number;
  liked: boolean;
  disliked?: boolean;
  /** ISO 8601 UTC instant. The library formats this for display. */
  timestamp: string;
  pinned?: boolean;
  replies: Reply[];
  image?: string;
  sticker?: string;
  subscription?: SubscriptionTier;
  badges?: string[];
}

export function formatLikes(count: number): string {
  if (count >= 1_000_000) {
    return (count / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return count.toString();
}
