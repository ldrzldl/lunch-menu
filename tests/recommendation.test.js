import test from 'node:test';
import assert from 'node:assert/strict';
import { filterItems, validateRequest, normalizeRestaurantItems } from '../server/index.js';

const ideas = [
  { id: 'a', name: '비빔밥', kind: 'idea', category: '한식', price: 9000, dietTags: ['채식 선택 가능'], reason: '균형 잡힌 메뉴예요.' },
  { id: 'b', name: '샐러드', kind: 'idea', category: '샐러드', price: 11000, dietTags: ['채식'], reason: '가벼운 메뉴예요.' }
];

test('rejects invalid modes, filters, and restaurant locations', () => {
  assert.throws(() => validateRequest({ mode: 'other' }), /mode/);
  assert.throws(() => validateRequest({ mode: 'idea', maxPrice: -1 }), /maxPrice/);
  assert.throws(() => validateRequest({ mode: 'restaurant' }), /location/);
  assert.throws(() => validateRequest({ mode: 'restaurant', location: { latitude: 91, longitude: 0 } }), /latitude/);
});

test('accepts a neighborhood fallback for restaurant mode', () => {
  assert.deepEqual(validateRequest({ mode: 'restaurant', location: { area: '성수동' } }).location, { area: '성수동' });
});

test('filters by category, price, diet, distance, and excluded IDs', () => {
  const items = [
    ...ideas,
    { id: 'c', name: '식당', kind: 'restaurant', category: '한식', price: 8000, distance: 1.2, dietTags: ['채식'], reason: '가까워요.', isAvailable: true, verifiedAt: new Date().toISOString() }
  ];
  assert.deepEqual(filterItems(items, { mode: 'idea', category: '한식', maxPrice: 9000 }), [ideas[0]]);
  assert.deepEqual(filterItems(items, { mode: 'restaurant', maxDistance: 2, dietTags: ['채식'], excludedIds: ['c'] }), []);
});

test('drops unverified, unavailable, malformed, and wrong-mode restaurant items', () => {
  const now = Date.parse('2026-07-13T03:00:00.000Z');
  const items = normalizeRestaurantItems([
    { id: 'good', name: '김치찌개', category: '한식', price: 8000, distance: 1, dietTags: [], reason: '가까워요.', isAvailable: true, verifiedAt: '2026-07-13T02:55:00.000Z' },
    { id: 'old', name: '오래된 메뉴', isAvailable: true, verifiedAt: '2026-07-12T00:00:00.000Z' },
    { id: 'closed', name: '닫은 식당', isAvailable: false, verifiedAt: '2026-07-13T02:55:00.000Z' }
  ], now);
  assert.deepEqual(items.map(({ id }) => id), ['good']);
});
