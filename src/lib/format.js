export function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  const units = [['y', 31536000], ['mo', 2592000], ['d', 86400], ['h', 3600], ['m', 60]];
  for (const [label, secs] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return 'just now';
}
export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') =>
  err?.data?.detail && typeof err.data.detail === 'string' ? err.data.detail
    : Array.isArray(err?.data?.detail) ? err.data.detail[0]?.msg ?? fallback
    : err?.status === 'FETCH_ERROR' ? "Can't reach the server. Check your connection." : fallback;
