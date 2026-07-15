import { BREEDS } from './data/breeds.js';

const QUESTIONS = [
  { id: 'rhythm', title: '평소 생활 리듬은?', options: ['아침형, 새벽부터 활동적으로 움직여요', '저녁형, 늦게 자고 늦게 일어나요', '규칙적이고 일정한 편이에요', '그날그날 다르고 불규칙해요'] },
  { id: 'home', title: '주거 형태는?', options: ['마당이 있는 단독주택', '아파트/빌라 (엘리베이터 있음)', '원룸/오피스텔 (좁은 실내)', '반려동물 동반 가능한 공동주택'] },
  { id: 'time', title: '하루 중 강아지에게 낼 수 있는 시간은?', options: ['30분 이하 (매우 바쁜 편)', '30분~1시간', '1~2시간', '2시간 이상 (거의 종일 함께 있어요)'] },
  { id: 'personality', title: '성향(간단 MBTI)은?', options: ['E (외향적, 활동적이고 사람·동물과 잘 어울림)', 'I (내향적, 조용하고 차분한 시간을 선호)', 'S/J 성향 강함 (규칙적이고 체계적인 걸 좋아함)', 'N/P 성향 강함 (즉흥적이고 자유로운 걸 좋아함)'] },
  { id: 'size', title: '선호하는 강아지 크기는?', options: ['소형견 (5kg 이하)', '중형견 (5~15kg)', '대형견 (15kg 이상)', '상관없음, 성격이 더 중요해요'] },
  { id: 'grooming', title: '털 알레르기나 털 관리에 대한 부담은?', options: ['알레르기가 있어 털 빠짐이 적은 강아지가 필요해요', '매일 빗질/미용 관리 가능해요', '가끔만 관리할 수 있어요', '상관없어요'] },
  { id: 'noise', title: '짖음(소음)에 대한 주변 환경은?', options: ['층간소음에 예민해서 조용한 강아지가 필요해요', '어느 정도 짖어도 괜찮아요', '마당이 있어 소음 걱정이 적어요'] },
  { id: 'experience', title: '반려 경험이 있나요?', options: ['처음 키워봐요 (초보자)', '몇 번 키워본 경험이 있어요', '전문적으로 훈련까지 해본 경험이 있어요'] },
  { id: 'family', title: '함께 사는 가족 구성은?', options: ['1인 가구', '어린 자녀가 있는 가정', '다른 반려동물(개/고양이)이 있어요', '노년층 가족과 함께 살아요'] },
  { id: 'temperament', title: '원하는 강아지 성격은?', options: ['애교 많고 사람을 잘 따르는 성격', '독립적이고 혼자서도 잘 지내는 성격', '활발하고 에너지 넘치는 성격', '차분하고 온순한 성격'] },
  { id: 'exercise', title: '운동/산책 스타일은?', options: ['매일 격렬한 운동(뛰기, 등산 등)을 함께하고 싶어요', '가벼운 산책 정도면 충분해요', '실내 놀이 위주로 활동하고 싶어요'] },
  { id: 'budget', title: '예산(사료, 미용, 병원비 등 월 지출 여유)은?', options: ['넉넉한 편이에요', '보통이에요', '최소한으로 관리하고 싶어요'] },
  { id: 'training', title: '훈련/교육에 투자할 의지는?', options: ['전문 훈련사와 함께 체계적으로 훈련할 계획이에요', '기본적인 배변·훈련 정도만 직접 할 수 있어요', '시간이 많지 않아 최소한만 가능해요'] }
];

const state = { answers: {}, results: [], final: null };
const $ = (selector) => document.querySelector(selector);

function renderQuiz() {
  $('#quiz').innerHTML = QUESTIONS.map((question, index) => `
    <fieldset class="question">
      <legend><span>${String(index + 1).padStart(2, '0')}</span>${question.title}</legend>
      <div class="options">
        ${question.options.map((option, optionIndex) => `
          <label class="option">
            <input type="radio" name="${question.id}" value="${optionIndex}">
            <span>${option}</span>
          </label>`).join('')}
      </div>
    </fieldset>`).join('');
}

const clamp = (value, min = 1, max = 5) => Math.max(min, Math.min(max, value));
const distance = (actual, target) => Math.abs(actual - target);

function targetProfile(answers) {
  const time = [1, 2, 3, 5][answers.time];
  const exercise = answers.exercise === 0 ? 5 : answers.exercise === 1 ? 2 : 2;
  let social = answers.temperament === 0 ? 5 : answers.temperament === 1 ? 2 : answers.temperament === 3 ? 3 : 4;
  let alone = answers.temperament === 1 ? 5 : 2;
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
    time,
    size: answers.size,
    family: answers.family,
    experience: answers.experience,
    rhythm: answers.rhythm,
    home: answers.home,
    personality: answers.personality,
    temperament: answers.temperament,
    exerciseChoice: answers.exercise,
    training: answers.training
  };
}

function sizeScore(size, preference, home) {
  if (preference === 3) return 100;
  const small = size === 'S' || size === 'S/M';
  const medium = size === 'M' || size === 'M/L' || size === 'S/M';
  const large = size === 'L' || size === 'M/L' || size === 'M/L';
  if (preference === 0) return small ? 100 : 25;
  if (preference === 1) return medium ? 100 : 30;
  return large ? 100 : 25;
}

function scoreBreed(breed, profile) {
  const metricScore = (actual, target) => 100 - distance(actual, target) * 22;
  let score = sizeScore(breed.size, profile.size, profile.home);
  score = score * 0.25
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

function reasons(breed, profile) {
  const candidates = [];
  if (profile.size === 3 || (profile.size === 0 && ['S', 'S/M'].includes(breed.size)) || (profile.size === 1 && ['M', 'S/M'].includes(breed.size)) || (profile.size === 2 && ['L', 'M/L'].includes(breed.size))) candidates.push('선호한 크기 조건과 가까워요');
  if (distance(breed.exercise, profile.exercise) <= 1) candidates.push('희망한 운동량과 잘 맞아요');
  if (distance(breed.grooming, profile.grooming) <= 1) candidates.push('털 관리 부담에 대한 조건과 가까워요');
  if (distance(breed.train, profile.train) <= 1) candidates.push('현재 훈련 경험과 잘 맞을 가능성이 있어요');
  if (distance(breed.social, profile.social) <= 1) candidates.push('원하는 교감·사회성 성향과 가까워요');
  if (distance(breed.vocal, profile.vocal) <= 1) candidates.push('주거 환경의 소음 조건과 비교적 잘 맞아요');
  return candidates.slice(0, 2);
}

function cautions(breed, profile) {
  const notes = [];
  if (breed.exercise >= 4 && profile.exercise <= 2) notes.push('매일 충분한 산책과 놀이가 필요해요');
  if (breed.grooming >= 4 && profile.grooming <= 2) notes.push('정기적인 빗질·미용 부담을 확인하세요');
  if (breed.vocal >= 4 && profile.vocal <= 2) notes.push('공동주택에서는 짖음 교육이 중요해요');
  if ((breed.size === 'L' || breed.size === 'M/L') && profile.home === 2) notes.push('좁은 실내에서 생활공간과 운동 계획을 확인하세요');
  if (breed.alone <= 1 && profile.alone >= 4) notes.push('혼자 있는 시간이 길면 어려울 수 있어요');
  if (breed.cost >= 4 && profile.cost <= 2) notes.push('사료·미용·병원비 여유를 먼저 확인하세요');
  return notes.length ? notes.slice(0, 2) : ['개체별 성격과 건강 상태를 직접 확인하세요'];
}

function recommend(answers, limit = 3) {
  const profile = targetProfile(answers);
  return BREEDS.map((breed) => ({ breed, score: scoreBreed(breed, profile), reasons: reasons(breed, profile), cautions: cautions(breed, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function renderResults(results) {
  const medals = ['🥇', '🥈', '🥉', '4위', '5위'];
  $('#results-list').innerHTML = results.map((result, index) => `
    <article class="result-card rank-${index + 1}">
      <div class="medal">${medals[index]}</div>
      <div class="result-main">
        <p class="rank">${['금메달', '은메달', '동메달', '4위', '5위'][index]} · 적합도 ${Math.round(result.score)}점</p>
        <h3>${result.breed.name}</h3>
        <p>${result.breed.description}</p>
        <div class="result-columns">
          <div><strong>추천 이유</strong><ul>${result.reasons.map((item) => `<li>${item}</li>`).join('')}</ul></div>
          <div><strong>확인할 점</strong><ul>${result.cautions.map((item) => `<li>${item}</li>`).join('')}</ul></div>
        </div>
        <div class="tags">${result.breed.tags.map((tag) => `<span>${tag}</span>`).join('')}</div>
      </div>
    </article>`).join('');
  $('#quiz-panel').hidden = true;
  $('#results-panel').hidden = false;
  $('#subjective-panel').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderFinal(result) {
  const recommendation = result.recommendation;
  $('#final-breed').textContent = recommendation.breedName;
  $('#final-summary').textContent = recommendation.summary;
  for (const [id, items] of [['final-objective', recommendation.objectiveFit], ['final-subjective', recommendation.subjectiveFit], ['final-cautions', recommendation.cautions]]) {
    const list = $(`#${id}`);
    list.replaceChildren(...(items || []).map((item) => Object.assign(document.createElement('li'), { textContent: item })));
  }
  const sources = $('#final-sources');
  sources.replaceChildren(...(recommendation.sources || []).map((source) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.title;
    item.append(link, source.snippet ? ` — ${source.snippet}` : '');
    return item;
  }));
  $('#final-source-block').hidden = !recommendation.sources?.length;
  $('#final-fallback').hidden = !result.fallback;
  $('#final-panel').hidden = false;
}

async function requestFinal() {
  const subjective = Object.fromEntries([...document.querySelectorAll('[data-subjective]')].map((input) => [input.dataset.subjective, input.value.trim()]));
  if (!Object.values(subjective).some(Boolean)) {
    $('#subjective-validation').hidden = false;
    $('#subjective-validation').textContent = '주관식 답변을 하나 이상 입력해 주세요.';
    document.querySelector('[data-subjective]').focus();
    return;
  }
  const button = $('#final-recommendation');
  button.disabled = true;
  $('#subjective-validation').hidden = true;
  $('#agent-status').textContent = '다섯 후보와 답변을 검토하고 있습니다…';
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ subjective, candidates: state.results.map(({ breed }) => ({ name: breed.name })) })
    });
    if (!response.ok) throw new Error('request failed');
    state.final = await response.json();
    renderFinal(state.final);
    $('#agent-status').textContent = state.final.searched ? '웹 검색 결과를 반영했습니다.' : '추가 검색 없이 후보를 검토했습니다.';
    $('#final-heading').focus();
  } catch {
    $('#agent-status').textContent = '최종 추천을 불러오지 못했습니다. 다섯 후보를 참고해 주세요.';
  } finally {
    button.disabled = false;
  }
}

function showValidation() {
  $('#validation').textContent = '모든 질문에 답해 주세요.';
  $('#validation').hidden = false;
  const firstMissing = QUESTIONS.find((question) => state.answers[question.id] === undefined);
  document.querySelector(`input[name="${firstMissing.id}"]`)?.focus();
}

renderQuiz();
$('#quiz').addEventListener('change', (event) => {
  if (event.target.matches('input[type="radio"]')) state.answers[event.target.name] = Number(event.target.value);
  $('#validation').hidden = true;
});
$('#quiz-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (Object.keys(state.answers).length !== QUESTIONS.length) return showValidation();
  state.results = recommend(state.answers, 5);
  renderResults(state.results);
});
$('#restart').addEventListener('click', () => {
  state.answers = {};
  state.final = null;
  $('#quiz-form').reset();
  $('#results-panel').hidden = true;
  $('#subjective-panel').hidden = true;
  $('#final-panel').hidden = true;
  $('#agent-status').textContent = '';
  for (const input of document.querySelectorAll('[data-subjective]')) input.value = '';
  $('#quiz-panel').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

$('#final-recommendation').addEventListener('click', requestFinal);
