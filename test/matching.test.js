import test from 'node:test';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';

import { BREEDS } from '../src/data/breeds.js';
import {
  createEmptyFilters,
  countCandidates,
  filterBreeds,
  HARD_RANGE_KEYS,
  hasActiveCondition,
  mapSurveyAnswers,
  rankBreeds,
  SOFT_RANGE_KEYS,
  SURVEY_QUESTIONS
} from '../src/matching.js';

test('breed dataset has 40 normalized, uniquely identified records', () => {
  assert.equal(BREEDS.length, 40);
  assert.equal(new Set(BREEDS.map(({ id }) => id)).size, 40);

  for (const breed of BREEDS) {
    assert.match(breed.id, /^[a-z0-9-]+$/);
    assert.ok(breed.name);
    for (const key of ['exercise', 'shedding', 'grooming', 'vocal']) {
      assert.ok(Number.isInteger(breed[key]) && breed[key] >= 1 && breed[key] <= 5, `${breed.name}.${key}`);
    }
    assert.ok(breed.size === null || (Number.isInteger(breed.size) && breed.size >= 1 && breed.size <= 5));
    assert.ok(Number.isInteger(breed.minHome) && breed.minHome >= 1 && breed.minHome <= 3);
    assert.equal(typeof breed.noviceFriendly, 'boolean');
    assert.equal(typeof breed.childFriendly, 'boolean');
    assert.ok(Array.isArray(breed.tags) && breed.tags.length > 0);
    assert.ok(breed.description);
  }

  assert.equal(BREEDS.find(({ id }) => id === 'mixed-breed').size, null);
});

const fixtureBreed = (id, exercise, overrides = {}) => ({
  id,
  name: id,
  exercise,
  shedding: 3,
  grooming: 3,
  vocal: 3,
  size: 2,
  minHome: 1,
  noviceFriendly: true,
  childFriendly: true,
  tags: ['fixture'],
  description: 'fixture',
  ...overrides
});

test('hard ranges prune while soft ranges only score', () => {
  const filters = createEmptyFilters();
  assert.equal(hasActiveCondition(filters), false);
  assert.deepEqual(HARD_RANGE_KEYS, ['vocal', 'size']);
  assert.deepEqual(SOFT_RANGE_KEYS, ['exercise', 'shedding', 'grooming']);
  filters.ranges.exercise = { min: 2, max: 3 };
  assert.equal(hasActiveCondition(filters), true);

  const breeds = [
    fixtureBreed('low', 1, { size: 1 }),
    fixtureBreed('min', 2, { size: 2 }),
    fixtureBreed('max', 3, { size: 3 }),
    fixtureBreed('high', 4, { size: 4 }),
    fixtureBreed('missing', 3, { size: null })
  ];
  assert.deepEqual(filterBreeds(breeds, filters).map(({ id }) => id), ['low', 'min', 'max', 'high', 'missing']);
  filters.ranges.size = { min: 2, max: 3 };
  assert.deepEqual(filterBreeds(breeds, filters).map(({ id }) => id), ['min', 'max']);
});

test('categorical hard filters apply only their restrictive cases', () => {
  const breeds = [
    fixtureBreed('easy-small', 2),
    fixtureBreed('advanced-yard', 2, { minHome: 3, noviceFriendly: false, childFriendly: false })
  ];
  const filters = createEmptyFilters();
  filters.housing = 1;
  filters.experience = 'novice';
  filters.children = true;
  assert.deepEqual(filterBreeds(breeds, filters).map(({ id }) => id), ['easy-small']);

  filters.housing = 3;
  filters.experience = 'experienced';
  filters.children = false;
  assert.deepEqual(filterBreeds(breeds, filters).map(({ id }) => id), ['easy-small', 'advanced-yard']);
});

test('base ranking is stable and returns zero to three existing candidates', () => {
  const filters = createEmptyFilters();
  filters.ranges.exercise = { min: 1, max: 5 };
  const breeds = [
    fixtureBreed('charlie', 3),
    fixtureBreed('alpha', 3),
    fixtureBreed('bravo', 3),
    fixtureBreed('delta', 3)
  ];
  assert.deepEqual(rankBreeds(breeds, filters).map(({ breed }) => breed.id), ['alpha', 'bravo', 'charlie']);
  assert.equal(rankBreeds([], filters).length, 0);
  assert.equal(rankBreeds(breeds.slice(0, 1), filters).length, 1);
  assert.equal(rankBreeds(breeds.slice(0, 2), filters).length, 2);
  assert.equal(rankBreeds(breeds, filters).length, 3);
});

test('survey mappings honor weighted boundaries and high-tolerance Any', () => {
  assert.equal(SURVEY_QUESTIONS.length, 14);
  assert.deepEqual(Object.fromEntries(['activity', 'shedding', 'grooming', 'housing', 'size', 'experience', 'children']
    .map((group) => [group, SURVEY_QUESTIONS.filter((question) => question.group === group).length])), {
    activity: 2, shedding: 2, grooming: 2, housing: 2, size: 2, experience: 2, children: 2
  });
  assert.deepEqual(mapSurveyAnswers({ walkTime: 1, holidayActivity: 1 }, 'holidayActivity'), { ranges: { exercise: { min: 1, max: 2 } } });
  assert.deepEqual(mapSurveyAnswers({ walkTime: 2, holidayActivity: 2 }, 'holidayActivity'), { ranges: { exercise: { min: 2, max: 4 } } });
  assert.deepEqual(mapSurveyAnswers({ walkTime: 3, holidayActivity: 3 }, 'holidayActivity'), { ranges: { exercise: { min: 3, max: 5 } } });
  assert.deepEqual(mapSurveyAnswers({ hairSensitivity: 3, hairCleaning: 3 }, 'hairCleaning'), { ranges: { shedding: null } });
  assert.deepEqual(mapSurveyAnswers({ careTime: 2, groomingBudget: 2 }, 'groomingBudget'), { ranges: { grooming: { min: 1, max: 3 } } });
  assert.deepEqual(mapSurveyAnswers({ livingSpace: 2, handlingSize: 2 }, 'handlingSize'), { ranges: { size: { min: 2, max: 3 } } });
  assert.deepEqual(mapSurveyAnswers({ livingSpace: 3, handlingSize: 3 }, 'handlingSize'), { ranges: { size: { min: 3, max: 5 } } });
});

test('survey tables are exhaustive, conservative, shared, and partial-safe', () => {
  assert.deepEqual(mapSurveyAnswers({ walkTime: 1 }, 'walkTime'), {});
  assert.deepEqual(mapSurveyAnswers({ homeType: 1, soundproofing: 3 }, 'soundproofing'), {
    ranges: { vocal: { min: 1, max: 2 } }, housing: 1
  });
  assert.deepEqual(mapSurveyAnswers({ homeType: 3, soundproofing: 2 }, 'soundproofing'), {
    ranges: { vocal: { min: 1, max: 3 } }, housing: 3
  });
  assert.deepEqual(mapSurveyAnswers({ homeType: 3, soundproofing: 3 }, 'homeType'), {
    ranges: { vocal: null }, housing: 3
  });
  assert.deepEqual(mapSurveyAnswers({ dogExperience: 2, trainingConfidence: 1 }, 'trainingConfidence'), { experience: 'novice' });
  assert.deepEqual(mapSurveyAnswers({ dogExperience: 2, trainingConfidence: 2 }, 'trainingConfidence'), { experience: 'experienced' });
  assert.deepEqual(mapSurveyAnswers({ childResidence: 2, childContact: 1 }, 'childContact'), { children: true });
  assert.deepEqual(mapSurveyAnswers({ childResidence: 2, childContact: 2 }, 'childContact'), { children: false });
});

test('priority doubles its distance and percentage uses the same maximum weight', () => {
  const filters = createEmptyFilters();
  filters.ranges.exercise = { min: 1, max: 5 };
  filters.ranges.shedding = { min: 1, max: 5 };
  filters.priority = 'exercise';
  const [result] = rankBreeds([fixtureBreed('weighted', 4, { shedding: 1 })], filters);
  assert.equal(result.penalty, 4);
  assert.equal(result.matchPercent, 33);
});

test('match percentage clamps to 0 and 100 and hard-only input uses a label', () => {
  const filters = createEmptyFilters();
  filters.ranges.exercise = { min: 1, max: 5 };
  const results = rankBreeds([fixtureBreed('perfect', 3), fixtureBreed('edge', 1)], filters);
  assert.equal(results.find(({ breed }) => breed.id === 'perfect').matchPercent, 100);
  assert.equal(results.find(({ breed }) => breed.id === 'edge').matchPercent, 0);

  const categories = createEmptyFilters();
  categories.housing = 3;
  const [categorical] = rankBreeds([fixtureBreed('category', 3)], categories);
  assert.equal(categorical.matchPercent, null);
  assert.equal(categorical.matchLabel, '선택 조건 충족');

  const hardRange = createEmptyFilters();
  hardRange.ranges.size = { min: 2, max: 2 };
  const [hard] = rankBreeds([fixtureBreed('hard', 3)], hardRange);
  assert.equal(hard.matchPercent, null);
  assert.equal(hard.reason, '크기 조건을 충족해요');
});

test('reason and caution use deterministic range order and repeated results stay identical', () => {
  const filters = createEmptyFilters();
  filters.ranges.exercise = { min: 1, max: 5 };
  filters.ranges.shedding = { min: 1, max: 5 };
  const breeds = [fixtureBreed('explain', 3, { shedding: 5 })];
  const [result] = rankBreeds(breeds, filters);
  assert.equal(result.reason, '활동량 조건과 가장 가까워요');
  assert.equal(result.caution, '털 빠짐 조건과 차이가 있어요');
  const expected = JSON.stringify(rankBreeds(breeds, filters));
  for (let index = 0; index < 100; index += 1) assert.equal(JSON.stringify(rankBreeds(breeds, filters)), expected);
});

test('candidate counting stays below the 200ms p95 target', () => {
  const filters = createEmptyFilters();
  filters.ranges.vocal = { min: 1, max: 3 };
  const durations = Array.from({ length: 100 }, () => {
    const start = performance.now();
    countCandidates(BREEDS, filters);
    return performance.now() - start;
  }).sort((a, b) => a - b);
  assert.ok(durations[94] < 200, `p95=${durations[94]}ms`);
});
