import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRestaurantMenus, normalizeRestaurantItems } from './restaurant-provider.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.dirname(ROOT);
const PUBLIC_ROOT = path.join(PROJECT_ROOT, 'src');
const IDEA_FILE = path.join(PUBLIC_ROOT, 'data', 'lunch-ideas.json');

function invalid(field) {
  throw new Error(`INVALID_${field}`);
}

export function validateRequest(input) {
  if (!input || !['idea', 'restaurant'].includes(input.mode)) invalid('mode');
  for (const field of ['maxPrice', 'maxDistance']) {
    if (input[field] !== undefined && (!Number.isFinite(input[field]) || input[field] < 0)) invalid(field);
  }
  if (input.category !== undefined && typeof input.category !== 'string') invalid('category');
  if (input.dietTags !== undefined && (!Array.isArray(input.dietTags) || input.dietTags.some((tag) => typeof tag !== 'string'))) invalid('dietTags');
  if (input.excludedIds !== undefined && (!Array.isArray(input.excludedIds) || input.excludedIds.some((id) => typeof id !== 'string'))) invalid('excludedIds');

  const location = input.location;
  if (input.mode === 'restaurant') {
    const hasCoordinates = location && Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
    const validCoordinates = hasCoordinates && location.latitude >= -90 && location.latitude <= 90 && location.longitude >= -180 && location.longitude <= 180;
    const hasArea = location && typeof location.area === 'string' && location.area.trim();
    if (location && hasCoordinates && !validCoordinates) invalid('latitude');
    if (!validCoordinates && !hasArea) invalid('location');
  }

  return {
    mode: input.mode,
    category: input.category?.trim() || undefined,
    maxPrice: input.maxPrice,
    maxDistance: input.maxDistance,
    dietTags: input.dietTags ?? [],
    location: input.mode === 'restaurant' ? {
      ...(Number.isFinite(location?.latitude) ? { latitude: location.latitude } : {}),
      ...(Number.isFinite(location?.longitude) ? { longitude: location.longitude } : {}),
      ...(typeof location?.area === 'string' && location.area.trim() ? { area: location.area.trim() } : {})
    } : undefined,
    excludedIds: input.excludedIds ?? []
  };
}

export function filterItems(items, criteria) {
  const excludedIds = criteria.excludedIds ?? [];
  const dietTags = criteria.dietTags ?? [];
  return items.filter((item) => {
    if (item.kind !== criteria.mode || excludedIds.includes(item.id)) return false;
    if (criteria.category && item.category !== criteria.category) return false;
    if (criteria.maxPrice !== undefined && (!Number.isFinite(item.price) || item.price > criteria.maxPrice)) return false;
    if (criteria.maxDistance !== undefined && (!Number.isFinite(item.distance) || item.distance > criteria.maxDistance)) return false;
    if (dietTags.some((tag) => !item.dietTags.includes(tag))) return false;
    return true;
  });
}

async function loadIdeas() {
  return JSON.parse(await fs.readFile(IDEA_FILE, 'utf8'));
}

export async function getRecommendations(input) {
  const criteria = validateRequest(input);
  const items = criteria.mode === 'idea'
    ? await loadIdeas()
    : await fetchRestaurantMenus(criteria);
  return filterItems(items, criteria);
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

async function readBody(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 100_000) throw new Error('BODY_TOO_LARGE');
  }
  return JSON.parse(raw || '{}');
}

const MIME_TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

async function serveStatic(request, response) {
  const requested = new URL(request.url, 'http://localhost').pathname;
  const relative = requested === '/' ? 'index.html' : requested.slice(1);
  const file = path.resolve(PUBLIC_ROOT, relative);
  if (!file.startsWith(`${PUBLIC_ROOT}${path.sep}`)) return sendJson(response, 404, { message: 'Not found' });
  try {
    const content = await fs.readFile(file);
    response.writeHead(200, { 'content-type': MIME_TYPES[path.extname(file)] ?? 'application/octet-stream' });
    response.end(content);
  } catch {
    sendJson(response, 404, { message: 'Not found' });
  }
}

export const server = http.createServer(async (request, response) => {
  try {
    if (request.method === 'POST' && request.url === '/api/recommend') {
      const items = await getRecommendations(await readBody(request));
      return sendJson(response, 200, { items, checkedAt: new Date().toISOString() });
    }
    if (request.method === 'GET') return serveStatic(request, response);
    sendJson(response, 405, { code: 'METHOD_NOT_ALLOWED', message: '지원하지 않는 요청이에요.', retryable: false });
  } catch (error) {
    const status = error.message.startsWith('INVALID_') ? 400 : error.message === 'RESTAURANT_PROVIDER_NOT_CONFIGURED' ? 503 : 502;
    const body = status === 400
      ? { code: 'INVALID_REQUEST', message: '추천 조건을 확인해 주세요.', retryable: false }
      : { code: 'TEMPORARY_FAILURE', message: '추천 정보를 불러오지 못했어요. 다시 시도해 주세요.', retryable: true };
    sendJson(response, status, body);
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  server.listen(port, () => console.log(`Lunch recommendation service listening on ${port}`));
}

export { normalizeRestaurantItems };
