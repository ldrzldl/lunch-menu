import { BREEDS } from './data/breeds.js';
import {
  RANGE_META,
  RANGE_KEYS,
  SOFT_RANGE_KEYS,
  SURVEY_QUESTIONS,
  countCandidates,
  createEmptyFilters,
  hasActiveCondition,
  mapSurveyAnswers,
  normalizeRange,
  rankBreeds
} from './matching.js';

const $ = (selector) => document.querySelector(selector);
const form = $('#matcher-form');
const state = { filters: createEmptyFilters(), answers: {}, results: [] };
const surveyGroups = [
  ['activity', '활동량'], ['shedding', '털 빠짐'], ['grooming', '미용·관리 부담'],
  ['housing', '주거 및 짖음'], ['size', '크기'], ['experience', '양육 경험'], ['children', '어린아이 동거']
];

function renderSurvey() {
  $('#survey-questions').innerHTML = surveyGroups.map(([group, label]) => `
    <details class="survey-group">
      <summary>${label}</summary>
      <div class="survey-group-questions">
        ${SURVEY_QUESTIONS.filter((question) => question.group === group).map((question) => `
          <fieldset class="survey-question">
            <legend>${question.prompt}</legend>
            <div class="survey-options">
              ${question.options.map(([option, value]) => `<label><input type="radio" name="survey-${question.id}" value="${value}" data-survey="${question.id}"> ${option}</label>`).join('')}
            </div>
          </fieldset>`).join('')}
      </div>
    </details>`).join('');
}

function syncRange(key) {
  const any = form.querySelector(`[data-any="${key}"]`);
  const inputs = [...form.querySelectorAll(`[data-range-key="${key}"]`)];
  const range = state.filters.ranges[key];
  any.checked = range === null;
  for (const input of inputs) {
    input.disabled = range === null;
    if (range) input.value = range[input.dataset.bound];
    $(`#${key}-${input.dataset.bound}-output`).value = input.value;
  }
}

function clearResults() {
  state.results = [];
  $('#results-list').replaceChildren();
  $('#results-panel').hidden = true;
  $('#empty-state').hidden = true;
}

function syncPriorityOptions() {
  const select = $('#priority');
  const active = SOFT_RANGE_KEYS.filter((key) => state.filters.ranges[key]);
  if (!active.includes(state.filters.priority)) state.filters.priority = null;
  select.innerHTML = `<option value="">없음</option>${active.map((key) => `<option value="${key}">${RANGE_META[key].label}</option>`).join('')}`;
  select.value = state.filters.priority || '';
}

function updateCandidateCount() {
  $('#candidate-count').textContent = `절대 조건 통과 후보: ${countCandidates(BREEDS, state.filters)}마리`;
}

function filtersChanged() {
  syncPriorityOptions();
  $('#validation').hidden = true;
  clearResults();
  updateCandidateCount();
}

function setCategory(select) {
  const { category } = select.dataset;
  if (!select.value) state.filters[category] = null;
  else if (category === 'housing') state.filters.housing = Number(select.value);
  else if (category === 'children') state.filters.children = select.value === 'true';
  else state.filters.experience = select.value;
}

function applySurveyPatch(patch) {
  if (patch.ranges) {
    for (const [key, range] of Object.entries(patch.ranges)) {
      state.filters.ranges[key] = range;
      syncRange(key);
    }
  }
  for (const key of ['housing', 'experience', 'children']) {
    if (!(key in patch)) continue;
    state.filters[key] = patch[key];
    form.querySelector(`[data-category="${key}"]`).value = String(patch[key]);
  }
}

function handleDirectInput(target) {
  if (target.matches('[data-survey]')) {
    state.answers[target.dataset.survey] = Number(target.value);
    const patch = mapSurveyAnswers(state.answers, target.dataset.survey);
    if (Object.keys(patch).length) {
      applySurveyPatch(patch);
      filtersChanged();
    }
    return;
  }

  if (target.matches('[data-any]')) {
    const key = target.dataset.any;
    const minInput = form.querySelector(`[data-range-key="${key}"][data-bound="min"]`);
    const maxInput = form.querySelector(`[data-range-key="${key}"][data-bound="max"]`);
    state.filters.ranges[key] = target.checked ? null : normalizeRange(key, minInput.value, maxInput.value);
    syncRange(key);
    return filtersChanged();
  }

  if (target.matches('[data-range-key]')) {
    const key = target.dataset.rangeKey;
    const minInput = form.querySelector(`[data-range-key="${key}"][data-bound="min"]`);
    const maxInput = form.querySelector(`[data-range-key="${key}"][data-bound="max"]`);
    state.filters.ranges[key] = normalizeRange(key, minInput.value, maxInput.value, target.dataset.bound);
    syncRange(key);
    return filtersChanged();
  }

  if (target.matches('[data-category]')) {
    setCategory(target);
    filtersChanged();
    return;
  }

  if (target.matches('[data-priority]')) {
    state.filters.priority = target.value || null;
    filtersChanged();
  }
}

function renderResults(results) {
  $('#results-list').innerHTML = results.map((result, index) => `
    <li><article class="result-card">
      <p class="rank">${index + 1}위 · ${result.matchLabel}</p>
      <h3>${result.breed.name}</h3>
      <p>${result.breed.description}</p>
      <div class="result-columns">
        <div><strong>추천 이유</strong><p>${result.reason}</p></div>
        <div><strong>확인할 점</strong><p>${result.caution}</p></div>
      </div>
      <p class="individual-notice">품종 특성은 참고용이며 실제 개체의 성격과 건강 상태는 다를 수 있어요.</p>
      <div class="tags">${result.breed.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
    </article></li>`).join('');
}

form.addEventListener('input', (event) => handleDirectInput(event.target));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!hasActiveCondition(state.filters)) {
    $('#validation').textContent = '하나 이상의 조건을 선택해 주세요.';
    $('#validation').hidden = false;
    form.querySelector('[data-any="exercise"]').focus();
    return;
  }

  state.results = rankBreeds(BREEDS, state.filters);
  $('#results-panel').hidden = false;
  if (!state.results.length) {
    $('#empty-state').textContent = '현재 조건을 모두 충족하는 견종이 없습니다. 범위나 절대 조건을 완화해 보세요.';
    $('#empty-state').hidden = false;
    $('#results-list').replaceChildren();
  } else {
    $('#empty-state').hidden = true;
    renderResults(state.results);
  }
  $('#results-heading').focus();
});

form.addEventListener('reset', () => {
  requestAnimationFrame(() => {
    state.filters = createEmptyFilters();
    state.answers = {};
    $('#guide').open = false;
    for (const key of RANGE_KEYS) syncRange(key);
    syncPriorityOptions();
    clearResults();
    $('#validation').hidden = true;
    updateCandidateCount();
  });
});

renderSurvey();
for (const key of RANGE_KEYS) syncRange(key);
syncPriorityOptions();
updateCandidateCount();
