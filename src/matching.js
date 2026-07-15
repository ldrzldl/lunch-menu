export const RANGE_META = {
  exercise: { label: '활동량', min: 1, max: 5, kind: 'soft' },
  shedding: { label: '털 빠짐', min: 1, max: 5, kind: 'soft' },
  grooming: { label: '미용·관리 부담', min: 1, max: 5, kind: 'soft' },
  vocal: { label: '짖음', min: 1, max: 5, kind: 'hard' },
  size: { label: '크기', min: 1, max: 5, kind: 'hard' }
};

export const RANGE_KEYS = Object.keys(RANGE_META);
export const HARD_RANGE_KEYS = RANGE_KEYS.filter((key) => RANGE_META[key].kind === 'hard');
export const SOFT_RANGE_KEYS = RANGE_KEYS.filter((key) => RANGE_META[key].kind === 'soft');

export const SURVEY_QUESTIONS = [
  { id:'walkTime', group:'activity', prompt:'하루 평균 순수 산책을 위해 낼 수 있는 시간은?', options:[['30분 미만',1],['1시간 내외',2],['2시간 이상',3]] },
  { id:'holidayActivity', group:'activity', prompt:'평소 휴일 활동 스타일은?', options:[['주로 집에서 휴식',1],['가벼운 외출',2],['등산·캠핑 등 아웃도어',3]] },
  { id:'hairSensitivity', group:'shedding', prompt:'집 안의 털 빠짐에 얼마나 민감한가요?', options:[['매우 민감해요',1],['어느 정도 괜찮아요',2],['상관없어요',3]] },
  { id:'hairCleaning', group:'shedding', prompt:'털 청소를 얼마나 자주 할 수 있나요?', options:[['최소한만 가능해요',1],['주 2~3회 가능해요',2],['매일 가능해요',3]] },
  { id:'careTime', group:'grooming', prompt:'빗질과 홈케어에 낼 수 있는 시간은?', options:[['최소한만 가능해요',1],['주기적으로 가능해요',2],['매일 가능해요',3]] },
  { id:'groomingBudget', group:'grooming', prompt:'전문 미용 비용 부담은 어떤가요?', options:[['정기 지출은 어려워요',1],['가끔 가능해요',2],['정기적으로 가능해요',3]] },
  { id:'homeType', group:'housing', prompt:'현재 거주 공간의 형태는?', options:[['원룸·다세대 공동주택',1],['아파트',2],['마당 있는 단독주택',3]] },
  { id:'soundproofing', group:'housing', prompt:'방음 상태와 이웃의 소음 민감도는?', options:[['방음이 어렵거나 매우 민감해요',1],['보통이에요',2],['방음이 좋거나 이웃이 없어요',3]] },
  { id:'livingSpace', group:'size', prompt:'강아지가 생활할 실내 공간은?', options:[['작은 편이에요',1],['보통이에요',2],['넓은 편이에요',3]] },
  { id:'handlingSize', group:'size', prompt:'안고 이동하거나 제어하기 편한 크기는?', options:[['작은 크기',1],['중간 크기',2],['큰 크기',3]] },
  { id:'dogExperience', group:'experience', prompt:'반려견을 직접 양육한 경험이 있나요?', options:[['처음이에요',1],['경험이 있어요',2]] },
  { id:'trainingConfidence', group:'experience', prompt:'기본 훈련을 일관되게 진행할 수 있나요?', options:[['최소한만 가능해요',1],['기본 훈련이 가능해요',2]] },
  { id:'childResidence', group:'children', prompt:'어린아이와 함께 살고 있나요?', options:[['예',1],['아니오',2]] },
  { id:'childContact', group:'children', prompt:'어린아이가 집에 자주 방문하거나 머무나요?', options:[['예',1],['아니오',2]] }
];

const complete = (answers, ids) => ids.every((id) => answers[id] !== undefined);
const points = (answers, first, second) => answers[first] * 60 + answers[second] * 40;
const setRange = (patch, key, value) => ((patch.ranges ||= {})[key] = value);

export function mapSurveyAnswers(answers, changedQuestionId) {
  const patch = {};
  const affects = (...ids) => (!changedQuestionId || ids.includes(changedQuestionId)) && complete(answers, ids);

  if (affects('walkTime', 'holidayActivity')) {
    const score = points(answers, 'walkTime', 'holidayActivity');
    setRange(patch, 'exercise', score < 170 ? { min:1, max:2 } : score < 240 ? { min:2, max:4 } : { min:3, max:5 });
  }
  if (affects('hairSensitivity', 'hairCleaning')) {
    const score = points(answers, 'hairSensitivity', 'hairCleaning');
    setRange(patch, 'shedding', score < 170 ? { min:1, max:2 } : score < 240 ? { min:1, max:3 } : null);
  }
  if (affects('careTime', 'groomingBudget')) {
    const score = points(answers, 'careTime', 'groomingBudget');
    setRange(patch, 'grooming', score < 170 ? { min:1, max:2 } : score < 240 ? { min:1, max:3 } : null);
  }
  if (affects('livingSpace', 'handlingSize')) {
    const score = points(answers, 'livingSpace', 'handlingSize');
    setRange(patch, 'size', score < 170 ? { min:1, max:2 } : score < 240 ? { min:2, max:3 } : { min:3, max:5 });
  }
  if (affects('homeType', 'soundproofing')) {
    const restrictive = answers.homeType === 1 || answers.soundproofing === 1;
    patch.housing = restrictive ? 1 : answers.homeType;
    setRange(patch, 'vocal', restrictive ? { min:1, max:2 } : answers.soundproofing === 2 ? { min:1, max:3 } : null);
  }
  if (affects('dogExperience', 'trainingConfidence')) {
    patch.experience = answers.dogExperience === 1 || answers.trainingConfidence === 1 ? 'novice' : 'experienced';
  }
  if (affects('childResidence', 'childContact')) {
    patch.children = answers.childResidence === 1 || answers.childContact === 1;
  }
  return patch;
}

export function createEmptyFilters() {
  return {
    ranges: Object.fromEntries(RANGE_KEYS.map((key) => [key, null])),
    housing: null,
    experience: null,
    children: null,
    priority: null
  };
}

export function normalizeRange(key, min, max, changed = 'min') {
  const scale = RANGE_META[key];
  if (!scale) throw new RangeError(`Unknown range: ${key}`);
  min = Math.max(scale.min, Math.min(scale.max, Number(min)));
  max = Math.max(scale.min, Math.min(scale.max, Number(max)));
  if (min > max) changed === 'min' ? max = min : min = max;
  return { min, max };
}

export function hasActiveCondition(filters) {
  return RANGE_KEYS.some((key) => filters.ranges[key] !== null)
    || filters.housing !== null
    || filters.experience !== null
    || filters.children !== null;
}

export function filterBreeds(breeds, filters) {
  return breeds.filter((breed) => {
    for (const key of HARD_RANGE_KEYS) {
      const range = filters.ranges[key];
      if (range && (!Number.isFinite(breed[key]) || breed[key] < range.min || breed[key] > range.max)) return false;
    }
    if (filters.housing !== null && (!Number.isFinite(breed.minHome) || breed.minHome > filters.housing)) return false;
    if (filters.experience === 'novice' && breed.noviceFriendly !== true) return false;
    if (filters.children === true && breed.childFriendly !== true) return false;
    return true;
  });
}

export function countCandidates(breeds, filters) {
  return filterBreeds(breeds, filters).length;
}

export function rankBreeds(breeds, filters, limit = 3) {
  const activeRanges = SOFT_RANGE_KEYS.filter((key) => filters.ranges[key]);
  const activeHardRanges = HARD_RANGE_KEYS.filter((key) => filters.ranges[key]);
  const priority = activeRanges.includes(filters.priority) ? filters.priority : null;
  return filterBreeds(breeds, filters)
    .map((breed) => {
      const distances = activeRanges.map((key) => {
        const { min, max } = filters.ranges[key];
        return { key, weighted: Math.abs(breed[key] - (min + max) / 2) * (priority === key ? 2 : 1) };
      });
      const penalty = distances.reduce((total, { weighted }) => total + weighted, 0);
      const maximumPenalty = activeRanges.reduce((total, key) => {
        const { min, max } = filters.ranges[key];
        const midpoint = (min + max) / 2;
        const scale = RANGE_META[key];
        return total + Math.max(Math.abs(scale.min - midpoint), Math.abs(scale.max - midpoint)) * (priority === key ? 2 : 1);
      }, 0);
      const matchPercent = activeRanges.length
        ? Math.max(0, Math.min(100, Math.round(100 * (1 - penalty / maximumPenalty))))
        : null;
      const closest = distances.reduce((best, item) => !best || item.weighted < best.weighted ? item : best, null);
      const farthest = distances.reduce((best, item) => !best || item.weighted > best.weighted ? item : best, null);
      const firstCondition = activeHardRanges.length ? RANGE_META[activeHardRanges[0]].label
        : filters.housing !== null ? '주거' : filters.experience !== null ? '양육 경험' : '어린아이 동거';
      return {
        breed,
        penalty,
        matchPercent,
        matchLabel: matchPercent === null ? '선택 조건 충족' : `${matchPercent}% 일치`,
        reason: closest ? `${RANGE_META[closest.key].label} 조건과 가장 가까워요` : `${firstCondition} 조건을 충족해요`,
        caution: farthest?.weighted > 0 ? `${RANGE_META[farthest.key].label} 조건과 차이가 있어요` : '실제 개체의 성격과 건강 상태를 직접 확인하세요'
      };
    })
    .sort((a, b) => a.penalty - b.penalty || (a.breed.id < b.breed.id ? -1 : a.breed.id > b.breed.id ? 1 : 0))
    .slice(0, limit)
    .map((result, index) => ({ ...result, rank: index + 1 }));
}
