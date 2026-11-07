/**
 * Safely parses an ISO date string into a Date object.
 * Database UTC timestamps serialized without a trailing 'Z' or timezone offset
 * will be parsed by browsers as local time unless explicitly treated as UTC.
 */
export function parseDate(iso) {
  if (!iso) return null;
  if (iso instanceof Date) return isNaN(iso) ? null : iso;
  if (typeof iso === 'string') {
    let s = iso.trim();
    // If ISO datetime string lacks a timezone specifier (e.g. "2026-11-06T16:22:00"),
    // append 'Z' so the browser parses it as UTC instead of local device time
    if (s.includes('T') && !s.endsWith('Z') && !/[+-]\d{2}:?\d{2}$/.test(s)) {
      s += 'Z';
    }
    const d = new Date(s);
    return isNaN(d) ? null : d;
  }
  const d = new Date(iso);
  return isNaN(d) ? null : d;
}

export function timeAgo(iso) {
  const d = parseDate(iso);
  if (!d) return '';
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  const units = [
    ['y', 31536000],
    ['mo', 2592000],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ];
  for (const [label, secs] of units) {
    if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  }
  return 'just now';
}

/**
 * Returns a human-readable absolute date/time string for tooltip display.
 * Example: "Nov 6, 2026 at 9:30 PM"
 */
export function formatExactDate(iso) {
  const d = parseDate(iso);
  if (!d) return '';
  try {
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.data?.detail && typeof err.data.detail === 'string' ? err.data.detail
    : Array.isArray(err?.data?.detail) ? err.data.detail[0]?.msg ?? fallback
    : err?.status === 'FETCH_ERROR' ? "Can't reach the server. Check your connection." : fallback;

