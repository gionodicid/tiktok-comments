"use client";

import { useEffect, useRef, useState } from "react";
import { X, Zap, Info } from "lucide-react";
import { BADGE_CATALOG, EarnedBadge, SubscriptionTier } from "./comment-data";
import { BadgeIcon } from "./badge-icon";

interface ProfileDrawerProps {
  name: string;
  avatar: string;
  subscription?: SubscriptionTier;
  badges?: string[];
  onClose: () => void;
}

const RARITY_ORDER: EarnedBadge["rarity"][] = ["legendary", "epic", "rare", "common"];

// Mock aura value — positive, negative, or zero
const MOCK_AURA = 1240;

const STATS = [
  { value: "1,585", label: "Comments" },
  { value: "112",   label: "Manga Read" },
  { value: "#35",   label: "Rank" },
];

export function ProfileDrawer({ name, avatar, subscription, badges, onClose }: ProfileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const earnedBadges = (badges || [])
    .map((id) => BADGE_CATALOG.find((b) => b.id === id))
    .filter((b): b is EarnedBadge => b !== undefined)
    .sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));

  const auraColor =
    MOCK_AURA > 0 ? "#f97316" : MOCK_AURA < 0 ? "#f87171" : "var(--muted-foreground)";

  const formattedAura =
    MOCK_AURA > 0
      ? `+${MOCK_AURA.toLocaleString()}`
      : MOCK_AURA.toLocaleString();

  return (
    <div
      className="tcm:fixed tcm:inset-0 tcm:z-50 tcm:flex tcm:items-end tcm:justify-center tcm:bg-black/60 tcm:backdrop-blur-sm tcm:animate-in tcm:fade-in tcm:duration-200"
      aria-modal="true"
      role="dialog"
    >
      <div
        ref={drawerRef}
        className="tcm:relative tcm:w-full tcm:max-w-md tcm:rounded-t-2xl tcm:overflow-hidden tcm:animate-in tcm:slide-in-from-bottom tcm:duration-300"
        style={{ background: "var(--card)" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="tcm:absolute tcm:top-4 tcm:right-4 tcm:z-10 tcm:w-8 tcm:h-8 tcm:rounded-full tcm:flex tcm:items-center tcm:justify-center tcm:hover:tcm:bg-muted tcm:transition-colors"
          aria-label="Close"
        >
          <X className="tcm:w-5 tcm:h-5 tcm:text-muted-foreground" />
        </button>

        {/* Banner — 80px strip with radial gradient from top badge color */}
        <div
          className="tcm:w-full tcm:h-20 tcm:shrink-0"
          style={{
            background: earnedBadges[0]
              ? `radial-gradient(ellipse at 50% 0%, ${earnedBadges[0].color}33 0%, transparent 70%)`
              : `radial-gradient(ellipse at 50% 0%, #ffffff18 0%, transparent 70%)`,
          }}
          aria-hidden
        />

        <div className="tcm:flex tcm:flex-col tcm:items-center tcm:text-center tcm:gap-4 tcm:px-6 tcm:pb-10">
          {/* Avatar — overlaps the banner by 20px via negative margin-top */}
          <div className="tcm:-mt-10">
            <img
              src={avatar}
              alt={`${name}'s avatar`}
              className="tcm:rounded-full tcm:object-cover tcm:w-20 tcm:h-20 tcm:ring-4"
              style={{ boxShadow: "0 0 0 4px var(--card)" }}
            />
          </div>

          <h2 className="tcm:text-xl tcm:font-bold tcm:text-foreground">{name}</h2>

          {subscription && (
            <span
              className="tcm:text-xs tcm:font-semibold tcm:uppercase tcm:px-3 tcm:py-1 tcm:rounded-full"
              style={{
                background: subscription === "max" ? "#f59e0b" : "#a855f7",
                color: "white",
              }}
            >
              {subscription === "max" ? "MAX Subscriber" : "PRO Subscriber"}
            </span>
          )}

          {/* Earned badges */}
          {earnedBadges.length > 0 && (
            <div className="tcm:w-full">
              <div className="tcm:flex tcm:flex-wrap tcm:justify-center tcm:gap-2">
                {earnedBadges.map((badge) => (
                  <span
                    key={badge.id}
                    className="tcm:flex tcm:items-center tcm:gap-1.5 tcm:text-xs tcm:font-medium tcm:px-2.5 tcm:py-1.5 tcm:rounded-full"
                    style={{
                      background: `${badge.color}1f`,
                      color: badge.color,
                      border: `1px solid ${badge.color}40`,
                    }}
                  >
                    <BadgeIcon name={badge.lucideIcon} className="tcm:w-3 tcm:h-3 tcm:shrink-0" strokeWidth={2} />
                    <span>{badge.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Aura — featured card */}
          <div
            className="tcm:w-full tcm:flex tcm:items-center tcm:gap-3 tcm:rounded-xl tcm:px-4 tcm:py-3 tcm:mt-1"
            style={{ background: "var(--muted)" }}
          >
            {/* Flame icon in dark square */}
            <div
              className="tcm:w-9 tcm:h-9 tcm:rounded-lg tcm:flex tcm:items-center tcm:justify-center tcm:shrink-0"
              style={{ background: "var(--background)" }}
            >
              <Zap size={18} style={{ color: "#f59e0b" }} />
            </div>

            {/* Number + label */}
            <div className="tcm:flex tcm:items-baseline tcm:gap-2">
              <span className="tcm:text-2xl tcm:font-bold tcm:tabular-nums" style={{ color: auraColor }}>
                {formattedAura}
              </span>
              <span className="tcm:text-[11px] tcm:font-semibold tcm:uppercase tcm:tracking-widest tcm:text-muted-foreground">
                Sigma
              </span>
            </div>

            {/* Info tooltip */}
            <div className="tcm:relative tcm:ml-auto">
              <button
                onMouseEnter={() => setTooltipVisible(true)}
                onMouseLeave={() => setTooltipVisible(false)}
                onFocus={() => setTooltipVisible(true)}
                onBlur={() => setTooltipVisible(false)}
                aria-label="What is Aura?"
                className="tcm:flex tcm:items-center tcm:justify-center"
              >
                <Info size={14} className="tcm:text-muted-foreground" />
              </button>
              {tooltipVisible && (
                <div
                  className="tcm:absolute tcm:bottom-6 tcm:right-0 tcm:w-52 tcm:text-xs tcm:px-3 tcm:py-2 tcm:rounded-lg tcm:shadow-lg tcm:z-10 tcm:text-left tcm:leading-relaxed"
                  style={{ background: "var(--popover)", color: "var(--popover-foreground)", border: "tcm:1px tcm:solid tcm:var(--border)" }}
                  role="tooltip"
                >
                  Total upvotes minus downvotes across all your comments
                </div>
              )}
            </div>
          </div>

          {/* Stats grid — 3 cols */}
          <div
            className="tcm:w-full tcm:grid tcm:grid-cols-3 tcm:gap-px tcm:rounded-xl tcm:overflow-hidden tcm:mt-1"
            style={{ background: "tcm:var(--border)" }}
          >
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="tcm:flex tcm:flex-col tcm:items-center tcm:py-3 tcm:gap-0.5"
                style={{ background: "var(--muted)" }}
              >
                <span className="tcm:text-base tcm:font-bold tcm:text-foreground tcm:tabular-nums">{value}</span>
                <span className="tcm:text-[11px] tcm:text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* View profile button */}
          <button
            className="tcm:w-full tcm:mt-4 tcm:py-3 tcm:rounded-lg tcm:text-sm tcm:font-semibold tcm:text-muted-foreground tcm:hover:tcm:text-foreground tcm:transition-colors"
            style={{ background: "var(--muted)" }}
          >
            View profile &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
