export function timeAgo(iso?: string) { return iso ? new Date(iso).toLocaleString() : '' }
