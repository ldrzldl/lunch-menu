import fs from 'node:fs/promises';
import { BREEDS } from '../src/data/breeds.js';
import { handleRecommend } from '../server/recommend.cjs';

const baseCases = JSON.parse(await fs.readFile(new URL('./golden.json', import.meta.url), 'utf8'));
const challengeCases = JSON.parse(await fs.readFile(new URL('./challenges.json', import.meta.url), 'utf8'));
const selectedCaseIds = JSON.parse(await fs.readFile(new URL('./selected-cases.json', import.meta.url), 'utf8'));
const allCases = [...baseCases, ...challengeCases];
const casesById = new Map(allCases.map((testCase) => [testCase.id, testCase]));
const requestedCase = process.argv.find((arg) => arg.startsWith('--case='))?.split('=').slice(1).join('=');
const cases = selectedCaseIds.map((id) => casesById.get(id)).filter((testCase) => testCase && (!requestedCase || testCase.id === requestedCase));
if (!cases.length) throw new Error(`활성 평가셋에서 사례를 찾을 수 없습니다: ${requestedCase}`);
const humanReview = JSON.parse(await fs.readFile(new URL('./human-review.json', import.meta.url), 'utf8'));
const judgeEnabled = process.argv.includes('--judge');

const distance = (actual, target) => Math.abs(actual - target);
const clamp = (value, min = 1, max = 5) => Math.max(min, Math.min(max, value));

function targetProfile(answers) {
  const time = [1, 2, 3, 5][answers.time];
  const exercise = answers.exercise === 0 ? 5 : 2;
  let social = answers.temperament === 0 ? 5 : answers.temperament === 1 ? 2 : answers.temperament === 3 ? 3 : 4;
  const alone = answers.temperament === 1 ? 5 : 2;
  if (answers.family === 1) social = 5;
  if (answers.family === 2) social = 4;
  return {
    exercise: clamp(Math.round((time + exercise) / 2)),
    alone,
    grooming: [1, 4, 2, 3][answers.grooming],
    vocal: answers.noise === 0 ? 1 : answers.noise === 1 ? 3 : 5,
    train: Math.round(([2, 3, 5][answers.experience] + [5, 3, 1][answers.training]) / 2),
    social,
    cost: [5, 3, 1][answers.budget],
    size: answers.size,
    home: answers.home,
    experience: answers.experience,
    temperament: answers.temperament,
    personality: answers.personality,
    exerciseChoice: answers.exercise
  };
}

function sizeScore(size, preference) {
  if (preference === 3) return 100;
  const small = size === 'S' || size === 'S/M';
  const medium = size === 'M' || size === 'M/L' || size === 'S/M';
  const large = size === 'L' || size === 'M/L';
  if (preference === 0) return small ? 100 : 25;
  if (preference === 1) return medium ? 100 : 30;
  return large ? 100 : 25;
}

function scoreBreed(breed, profile) {
  const metricScore = (actual, target) => 100 - distance(actual, target) * 22;
  let score = sizeScore(breed.size, profile.size) * 0.25
    + metricScore(breed.exercise, profile.exercise) * 0.18
    + metricScore(breed.alone, profile.alone) * 0.08
    + metricScore(breed.grooming, profile.grooming) * 0.10
    + metricScore(breed.vocal, profile.vocal) * 0.10
    + metricScore(breed.train, profile.train) * 0.10
    + metricScore(breed.social, profile.social) * 0.10
    + metricScore(breed.cost, profile.cost) * 0.09;
  if (profile.home === 2 && (breed.size === 'L' || breed.size === 'M/L')) score -= 10;
  if (profile.experience === 0 && breed.train <= 2) score -= 8;
  if (profile.exerciseChoice === 0 && breed.exercise >= 4) score += 7;
  if (profile.temperament === 1 && breed.alone >= 4) score += 8;
  if (profile.personality === 2 && breed.train >= 4) score += 4;
  return score;
}

function candidatesFor(answers) {
  const profile = targetProfile(answers);
  return BREEDS
    .map((breed) => ({ breed, score: scoreBreed(breed, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ breed }) => breed);
}

function deterministicChecks(testCase, result, candidates) {
  const recommendation = result.body?.recommendation;
  const candidateNames = new Set(candidates.map(({ name }) => name));
  const expectsFallback = testCase.criteria.some((criterion) => criterion.includes('fallback'));
  const checks = [
    ['status 200', result.status === 200],
    ['one recommendation', Boolean(recommendation?.breedName)],
    ['candidate whitelist', candidateNames.has(recommendation?.breedName)],
    ['fallback rule', !expectsFallback || result.body.fallback === true],
    ['no secret leakage', !JSON.stringify(result.body).match(/OPENAI_API_KEY|sk-[A-Za-z0-9_-]{10,}/)]
  ];
  if (result.body?.searched) {
    checks.push(['sources have valid URLs', (recommendation.sources || []).every((source) => /^https?:\/\//.test(source.url))]);
  }
  return checks;
}

async function judge(testCase, result, candidates) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_JUDGE_MODEL || process.env.OPENAI_MODEL || 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'Evaluate a dog-breed recommendation. The recommended breed must be exactly one of the supplied candidates. Return JSON only: {"score":1-5,"passed":true|false,"reason":"short Korean reason"}. Pass only when the result satisfies the criteria and all mandatory safety requirements.' },
        { role: 'user', content: JSON.stringify({ context: testCase.context, criteria: testCase.criteria, candidates: candidates.map(({ name }) => name), result: result.body }) }
      ]
    })
  });
  if (!response.ok) throw new Error(`judge HTTP ${response.status}`);
  const data = await response.json();
  return JSON.parse(data.choices?.[0]?.message?.content || '{}');
}

async function evaluateCase(testCase) {
  const candidates = candidatesFor(testCase.answers);
  const result = await handleRecommend({
    context: testCase.context,
    candidates: candidates.map(({ name }) => ({ name }))
  });
  const checks = deterministicChecks(testCase, result, candidates);
  let llmJudge = null;
  if (judgeEnabled) {
    try { llmJudge = await judge(testCase, result, candidates); }
    catch (error) { llmJudge = { passed: false, reason: error.message }; }
  }
  return {
    id: testCase.id,
    deterministicPass: checks.every(([, passed]) => passed),
    judgePass: !judgeEnabled || llmJudge?.passed === true,
    candidates: candidates.map(({ name }) => name),
    checks,
    llmJudge,
    result: result.body,
    recommendation: checks
  };
}

async function mapWithConcurrency(items, concurrency, task) {
  const output = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      output[index] = await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return output;
}

const rows = await mapWithConcurrency(cases, 3, evaluateCase);

const deterministicPassed = rows.filter((row) => row.deterministicPass).length;
const judgePassed = rows.filter((row) => row.judgePass).length;
const humanCompleted = humanReview.status === 'complete'
  && humanReview.cases.length === cases.length
  && humanReview.cases.every((item) => typeof item.hardRequirementsPassed === 'boolean'
    && Number.isInteger(item.score) && item.score >= 1 && item.score <= 5);
const humanPassed = humanCompleted
  ? humanReview.cases.filter((item) => item.hardRequirementsPassed && item.score >= humanReview.passScore).length
  : 0;
const humanAverage = humanCompleted
  ? humanReview.cases.reduce((sum, item) => sum + item.score, 0) / humanReview.cases.length
  : 0;
console.log(`골든셋: ${cases.length}개`);
console.log(`결정론적 평가: ${deterministicPassed}/${cases.length} (${(deterministicPassed / cases.length * 100).toFixed(0)}%)`);
console.log(humanCompleted
  ? `사람 평가: ${humanPassed}/${humanReview.cases.length} (${(humanPassed / humanReview.cases.length * 100).toFixed(0)}%), 평균 ${humanAverage.toFixed(2)}/5점`
  : '사람 평가: 미완료 (독립 평가자 입력 필요)');
if (judgeEnabled) console.log(`LLM-as-judge 평가: ${judgePassed}/${cases.length} (${(judgePassed / cases.length * 100).toFixed(0)}%)`);
for (const row of rows) {
  const status = row.deterministicPass && row.judgePass ? 'PASS' : 'FAIL';
  console.log(`${status} ${row.id}`);
  if (!row.deterministicPass) console.log(`  ${row.checks.filter(([, passed]) => !passed).map(([name]) => name).join(', ')}`);
  if (judgeEnabled && !row.judgePass) console.log(`  judge: ${row.llmJudge?.reason || 'failed'}`);
}

if (deterministicPassed !== cases.length || (judgeEnabled && judgePassed !== cases.length)) process.exitCode = 1;

const resultFile = requestedCase ? `./${requestedCase}-results.json` : './latest-results.json';
await fs.writeFile(new URL(resultFile, import.meta.url), `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  model: process.env.OPENAI_MODEL || null,
  judgeModel: judgeEnabled ? process.env.OPENAI_JUDGE_MODEL || process.env.OPENAI_MODEL || null : null,
  deterministicPassed,
  total: cases.length,
  rows
}, null, 2)}\n`, 'utf8');
console.log(`결과 파일: eval/${resultFile.slice(2)}`);
