const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/** Milliseconds since epoch, or 0 when `iso` is missing/invalid (sorts as oldest). */
export function timestampMs(iso: string): number {
  const n = Date.parse(iso);
  return Number.isNaN(n) ? 0 : n;
}

/**
 * Compact English relative label from an ISO 8601 UTC instant:
 * `now` / `Ns` / `Nm` / `Nh` / `Nd` / `Nw` / `Nmo` / `Ny`
 */
export function formatCommentTime(iso: string, now = Date.now()): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return "—";

  const diff = Math.max(0, now - then);
  if (diff < MINUTE) {
    const secs = Math.floor(diff / SECOND);
    return secs <= 0 ? "now" : `${secs}s`;
  }
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < WEEK) return `${Math.floor(diff / DAY)}d`;
  if (diff < MONTH) return `${Math.floor(diff / WEEK)}w`;
  if (diff < YEAR) return `${Math.floor(diff / MONTH)}mo`;
  return `${Math.floor(diff / YEAR)}y`;
}
