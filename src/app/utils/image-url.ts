export const API_ORIGIN = 'http://localhost:3000';

export function resolveImageUrl(
  path?: string | null,
  fallback: string = 'assets/images/egyptian.png'
): string {
  if (!path) return fallback;
  const value = String(path).trim();
  if (!value || value === 'default-user.webp') return fallback;
  if (
    value.startsWith('assets/') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value;
  }
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const normalized = value.replace(/\\/g, '/');
  const uploadsIndex = normalized.toLowerCase().lastIndexOf('/uploads/');
  const uploadsAtStart = normalized.toLowerCase().startsWith('uploads/');
  const cleaned = uploadsIndex !== -1
    ? normalized.slice(uploadsIndex + 1)
    : uploadsAtStart
      ? normalized
      : normalized.replace(/^\/+/, '');

  if (cleaned.toLowerCase().startsWith('uploads/')) {
    return `${API_ORIGIN}/${cleaned}`;
  }
  return `${API_ORIGIN}/uploads/${cleaned.replace(/^\/+/, '')}`;
}

export function listingDetailPath(item: { type?: string; _id?: string; id?: string }): string[] {
  const id = item._id || item.id;
  if (!id) return ['/restaurants'];
  return item.type === 'home_kitchen' ? ['/home-made', id] : ['/restaurant', id];
}
