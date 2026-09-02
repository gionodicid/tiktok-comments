import type { StickerItem, StickerPack } from "../../src/components/comment-data";

export const STICKER_PACKS: StickerPack[] = [
  { id: "cat", icon: "🐱", name: "Cats" },
  { id: "alien", icon: "👾", name: "Aliens" },
  { id: "masks", icon: "🎭", name: "Masks" },
  { id: "robot", icon: "🤖", name: "Robots" },
  { id: "pumpkin", icon: "🎃", name: "Pumpkins" },
];

const EMOJI_LABELS = [
  "fire",
  "heart",
  "laugh",
  "thumbs up",
  "party",
  "star",
  "cool",
  "wow",
  "cry",
  "love",
  "clap",
  "100",
  "sparkle",
  "ghost",
  "skull",
  "rainbow",
  "moon",
  "sun",
  "cat face",
  "dog",
  "pizza",
  "coffee",
  "music",
  "rocket",
];

type CatalogSticker = Omit<StickerItem, "favorited">;

export function seedStickerCatalog(): { packs: StickerPack[]; stickers: CatalogSticker[] } {
  const stickers: CatalogSticker[] = [];
  let seed = 20;

  for (const pack of STICKER_PACKS) {
    for (let i = 0; i < 8; i += 1) {
      stickers.push({
        id: `${pack.id}-${i}`,
        url: `https://picsum.photos/80/80?random=${seed}`,
        packId: pack.id,
        kind: "sticker",
        label: `${pack.name} ${i + 1}`,
      });
      seed += 1;
    }
  }

  for (let i = 0; i < EMOJI_LABELS.length; i += 1) {
    stickers.push({
      id: `emoji-${i}`,
      url: `https://picsum.photos/80/80?random=${seed}`,
      packId: "emoji",
      kind: "emoji",
      label: EMOJI_LABELS[i],
    });
    seed += 1;
  }

  return { packs: STICKER_PACKS, stickers };
}

export interface StickerQuery {
  pack?: string;
  q?: string;
  favorites?: boolean;
  kind?: "sticker" | "emoji";
  search?: boolean;
}

export function filterStickers(
  catalog: CatalogSticker[],
  packs: StickerPack[],
  favoriteIds: Set<string>,
  query: StickerQuery,
): StickerItem[] {
  let list = catalog;

  if (query.favorites) {
    list = list.filter((s) => favoriteIds.has(s.id));
  } else if (query.kind === "emoji") {
    list = list.filter((s) => s.kind === "emoji");
  } else if (query.pack) {
    list = list.filter((s) => s.packId === query.pack && s.kind === "sticker");
  } else if (!query.search && !query.q) {
    const defaultPack = packs[0]?.id;
    if (defaultPack) {
      list = list.filter((s) => s.packId === defaultPack && s.kind === "sticker");
    }
  }

  if (query.q) {
    const q = query.q.toLowerCase();
    list = list.filter((s) => {
      const packName = packs.find((p) => p.id === s.packId)?.name ?? "";
      return (
        s.label?.toLowerCase().includes(q) ||
        packName.toLowerCase().includes(q) ||
        s.packId.toLowerCase().includes(q)
      );
    });
  }

  return list.map((s) => ({
    ...s,
    favorited: favoriteIds.has(s.id),
  }));
}

export function withFavorited(
  catalog: CatalogSticker[],
  favoriteIds: Set<string>,
  id: string,
): StickerItem | undefined {
  const sticker = catalog.find((s) => s.id === id);
  if (!sticker) return undefined;
  return { ...sticker, favorited: favoriteIds.has(id) };
}
