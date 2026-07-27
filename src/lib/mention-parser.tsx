"use client";

import { ReactNode } from "react";

/**
 * Parse text and render @mentions as blue links.
 * Matches patterns like @username (alphanumeric + underscore)
 */
export function renderMentions(text: string): ReactNode {
  const mentionRegex = /(@[a-zA-Z0-9_]+)/g;
  const parts = text.split(mentionRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (mentionRegex.test(part)) {
      // It's a mention — render as blue link
      return (
        <a
          key={idx}
          href={`#${part.slice(1)}`}
          className="tcm:font-semibold tcm:hover:tcm:underline tcm:transition-colors"
          style={{ color: "oklch(0.62 0.15 255)" }}
          onClick={(e) => {
            // Prevent navigation; in a real app, this would trigger a profile modal
            e.preventDefault();
          }}
        >
          {part}
        </a>
      );
    }
    return part;
  });
}
