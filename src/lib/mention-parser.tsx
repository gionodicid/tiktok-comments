"use client";

import { ReactNode } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueNames(names: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const name of names) {
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    unique.push(name);
  }
  return unique.sort((a, b) => b.length - a.length);
}

function isMentionToken(part: string, names: string[]): boolean {
  if (!part.startsWith("@") || part.length < 2) return false;
  const rest = part.slice(1);
  if (names.some((name) => name.toLowerCase() === rest.toLowerCase())) return true;
  return /^[A-Za-z0-9_]+$/.test(rest);
}

export function renderMentions(
  text: string,
  options?: {
    names?: string[];
    onMentionClick?: (name: string) => void;
  },
): ReactNode {
  const names = uniqueNames(options?.names ?? []);
  const alternates = [
    ...names.map((name) => `@${escapeRegExp(name)}`),
    "@[A-Za-z0-9_]+",
  ];
  const pattern = new RegExp(`(${alternates.join("|")})`, "g");
  const parts = text.split(pattern);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (!isMentionToken(part, names)) return part;
    const name = part.slice(1);
    return (
      <button
        key={idx}
        type="button"
        className="tcm-font-semibold tcm-hover:tcm-underline tcm-transition-colors"
        style={{ color: "oklch(0.62 0.15 255)" }}
        onClick={() => options?.onMentionClick?.(name)}
      >
        {part}
      </button>
    );
  });
}
