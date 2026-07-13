const MAX_VERIFICATION_AGE_MS = 15 * 60 * 1000;

export function normalizeRestaurantItems(items, now = Date.now()) {
  if (!Array.isArray(items)) return [];

  return items.flatMap((item) => {
    const verifiedAt = Date.parse(item?.verifiedAt ?? '');
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') return [];
    if (item.isAvailable !== true || !Number.isFinite(verifiedAt)) return [];
    if (verifiedAt > now || now - verifiedAt > MAX_VERIFICATION_AGE_MS) return [];
    return [{
      id: item.id,
      name: item.name,
      kind: 'restaurant',
      category: typeof item.category === 'string' ? item.category : '기타',
      price: Number.isFinite(item.price) ? item.price : undefined,
      location: typeof item.location === 'string' ? item.location : undefined,
      distance: Number.isFinite(item.distance) ? item.distance : undefined,
      isAvailable: true,
      dietTags: Array.isArray(item.dietTags) ? item.dietTags.filter((tag) => typeof tag === 'string') : [],
      reason: typeof item.reason === 'string' && item.reason ? item.reason : '현재 이용 가능한 메뉴예요.',
      verifiedAt: new Date(verifiedAt).toISOString()
    }];
  });
}

export async function fetchRestaurantMenus(criteria, now = Date.now(), fetchImpl = fetch) {
  const endpoint = process.env.RESTAURANT_PROVIDER_URL;
  if (!endpoint) throw new Error('RESTAURANT_PROVIDER_NOT_CONFIGURED');

  const url = new URL(endpoint);
  url.searchParams.set('area', criteria.location.area ?? '');
  if (criteria.location.latitude !== undefined) url.searchParams.set('latitude', criteria.location.latitude);
  if (criteria.location.longitude !== undefined) url.searchParams.set('longitude', criteria.location.longitude);
  if (criteria.maxDistance !== undefined) url.searchParams.set('maxDistance', criteria.maxDistance);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetchImpl(url, {
      headers: process.env.RESTAURANT_PROVIDER_API_KEY
        ? { authorization: `Bearer ${process.env.RESTAURANT_PROVIDER_API_KEY}` }
        : {},
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`RESTAURANT_PROVIDER_${response.status}`);
    const payload = await response.json();
    return normalizeRestaurantItems(Array.isArray(payload) ? payload : payload.items, now);
  } finally {
    clearTimeout(timeout);
  }
}
