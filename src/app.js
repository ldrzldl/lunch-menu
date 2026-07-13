const CARE_LABELS = {
  walk: '산책',
  feed: '밥 주기',
  water: '물 갈기',
  waste: '배변 처리',
  check: '상태 확인'
};

const QUESTIONS = [
  '이 돌봄 시간을 평일에도 지속할 수 있나요?',
  '가족과 역할과 비용을 합의했나요?',
  '예상보다 바쁜 날에도 도움을 요청할 방법이 있나요?'
];

const clone = (value) => JSON.parse(JSON.stringify(value));

export function createSession({ now = new Date().toISOString(), seed = cryptoSeed(), scenario }) {
  const start = new Date(now).getTime();
  const requests = scenario.requests.map((definition, index) => {
    const dueAt = new Date(start + definition.offsetMinutes * 60_000).toISOString();
    return {
      id: `request-${index + 1}`,
      type: definition.type,
      dueAt,
      deadlineAt: new Date(start + (definition.offsetMinutes + scenario.requestWindowMinutes) * 60_000).toISOString(),
      status: 'pending',
      statusChangedAt: null,
      completedAt: null,
      estimatedMinutes: definition.estimatedMinutes,
      notificationState: 'not-sent'
    };
  });
  return {
    id: `session-${Date.now()}-${Math.abs(hash(seed))}`,
    status: 'active',
    seed,
    scenarioVersion: scenario.version,
    startedAt: now,
    pausedAt: null,
    endedAt: null,
    requests,
    records: []
  };
}

export function applyAction(session, requestId, action, now = new Date().toISOString()) {
  const next = clone(session);
  const request = next.requests.find((item) => item.id === requestId);
  if (!request) throw new Error('request not found');
  if (action === 'complete' && request.status === 'completed') return session;
  if (['completed', 'missed'].includes(request.status)) throw new Error('request is terminal');
  const transitions = { complete: 'completed', defer: 'deferred' };
  const toStatus = transitions[action];
  if (!toStatus) throw new Error('invalid action');
  const previous = request.status;
  request.status = toStatus;
  request.statusChangedAt = now;
  if (toStatus === 'completed') request.completedAt = now;
  next.records.push({
    id: `record-${next.records.length + 1}`,
    requestId,
    fromStatus: previous,
    toStatus,
    changedAt: now,
    elapsedMinutes: Math.max(0, (new Date(now) - new Date(request.dueAt)) / 60_000)
  });
  return next;
}

export function reconcileRequests(session, now = new Date().toISOString()) {
  const next = clone(session);
  if (next.status !== 'active') return next;
  const time = new Date(now).getTime();
  next.requests.forEach((request) => {
    if (['completed', 'missed'].includes(request.status)) return;
    if (time >= new Date(request.deadlineAt).getTime()) {
      const previous = request.status;
      request.status = 'missed';
      request.statusChangedAt = now;
      next.records.push({
        id: `record-${next.records.length + 1}`,
        requestId: request.id,
        fromStatus: previous,
        toStatus: 'missed',
        changedAt: now,
        elapsedMinutes: Math.max(0, (time - new Date(request.dueAt).getTime()) / 60_000)
      });
    }
  });
  return next;
}

export function getCurrentSummary(session) {
  const counts = countStatuses(session);
  return {
    ...counts,
    pendingCount: session.requests.filter((request) => request.status === 'pending').length,
    totalCareMinutes: session.requests.filter((request) => request.status === 'completed')
      .reduce((total, request) => total + request.estimatedMinutes, 0)
  };
}

export function getReflection(session) {
  const summary = getCurrentSummary(session);
  const difficultyTypes = [...new Set(session.requests
    .filter((request) => ['deferred', 'missed'].includes(request.status))
    .map((request) => request.type))];
  return {
    ...summary,
    difficultyTypes,
    questions: QUESTIONS,
    limitation: '이 결과는 실제 강아지의 행동이나 입양 적합성을 판정하지 않습니다.'
  };
}

export function saveSession(session, storage) {
  validateSession(session);
  storage.set(`dog-care:${session.id}`, JSON.stringify(session));
}

export function loadSession(id, storage) {
  const raw = storage.get(`dog-care:${id}`);
  if (!raw) return null;
  const session = JSON.parse(raw);
  validateSession(session);
  return session;
}

function validateSession(session) {
  if (!session?.id || !['active', 'paused', 'completed', 'abandoned'].includes(session.status) || !Array.isArray(session.requests)) {
    throw new Error('invalid session');
  }
}

function countStatuses(session) {
  return session.requests.reduce((counts, request) => {
    if (request.status === 'completed') counts.completedCount += 1;
    if (request.status === 'deferred') counts.deferredCount += 1;
    if (request.status === 'missed') counts.missedCount += 1;
    return counts;
  }, { completedCount: 0, deferredCount: 0, missedCount: 0 });
}

function hash(value) {
  return [...value].reduce((result, character) => ((result * 31) + character.charCodeAt(0)) | 0, 7);
}

function cryptoSeed() {
  return Math.random().toString(36).slice(2, 10);
}

function browserStorage() {
  return {
    get: (key) => localStorage.getItem(key),
    set: (key, value) => localStorage.setItem(key, value)
  };
}

async function loadScenario() {
  const response = await fetch('/data/care-scenarios.json');
  if (!response.ok) throw new Error('scenario load failed');
  return response.json();
}

function getStoredSessionId() {
  return localStorage.getItem('dog-care:active-session');
}

function setStoredSessionId(id) {
  localStorage.setItem('dog-care:active-session', id);
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function renderStatus(session) {
  const summary = getCurrentSummary(session);
  document.querySelector('#summary').textContent = `완료 ${summary.completedCount} · 미룸 ${summary.deferredCount} · 놓침 ${summary.missedCount} · 예상 돌봄 ${summary.totalCareMinutes}분`;
}

function renderRequests(session, scenario) {
  const list = document.querySelector('#requests');
  list.replaceChildren();
  session.requests.forEach((request) => {
    const item = document.createElement('li');
    item.className = `request request-${request.status}`;
    const label = scenario.labels[request.type] || CARE_LABELS[request.type] || request.type;
    item.innerHTML = `<strong>${label}</strong><span>기한 ${formatTime(request.deadlineAt)}</span><span class="request-status">${statusLabel(request.status)}</span>`;
    const actions = document.createElement('div');
    actions.className = 'actions';
    if (!['completed', 'missed'].includes(request.status)) {
      actions.append(button('완료', () => updateAction(request.id, 'complete')));
      actions.append(button('나중에', () => updateAction(request.id, 'defer')));
    }
    item.append(actions);
    list.append(item);
  });
}

function statusLabel(status) {
  return { pending: '대기 중', deferred: '나중에 처리', completed: '완료', missed: '놓침' }[status];
}

function button(label, onClick) {
  const element = document.createElement('button');
  element.type = 'button';
  element.textContent = label;
  element.addEventListener('click', onClick);
  return element;
}

let currentSession;
let currentScenario;

async function updateAction(requestId, action) {
  try {
    const updated = applyAction(currentSession, requestId, action);
    saveSession(updated, browserStorage());
    currentSession = updated;
    render();
    announce('돌봄 기록을 저장했습니다.');
  } catch {
    announce('기록을 저장하지 못했습니다. 다시 시도해 주세요.');
  }
}

function announce(message) {
  document.querySelector('#message').textContent = message;
}

function render() {
  notifyDueRequests();
  renderStatus(currentSession);
  renderRequests(currentSession, currentScenario);
  document.querySelector('#start-panel').hidden = true;
  document.querySelector('#session').hidden = false;
  if (currentSession.status === 'completed') renderReflection();
}

function notifyDueRequests() {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
  const now = Date.now();
  currentSession.requests.forEach((request) => {
    if (request.notificationState === 'not-sent' && new Date(request.dueAt).getTime() <= now && request.status === 'pending') {
      new Notification(`돌봄 요청: ${currentScenario.labels[request.type] || CARE_LABELS[request.type]}`, { body: '기한 안에 돌봄 행동을 기록해 주세요.' });
      request.notificationState = 'sent';
    }
  });
  saveSession(currentSession, browserStorage());
}

function renderReflection() {
  const reflection = getReflection(currentSession);
  document.querySelector('#reflection').hidden = false;
  document.querySelector('#reflection-content').textContent = `${reflection.limitation} 어려웠던 돌봄: ${reflection.difficultyTypes.map((type) => currentScenario.labels[type]).join(', ') || '없음'}. 스스로 점검해 보세요: ${reflection.questions.join(' ')}`;
}

async function start() {
  try {
    currentScenario = await loadScenario();
    currentSession = createSession({ scenario: currentScenario });
    saveSession(currentSession, browserStorage());
    setStoredSessionId(currentSession.id);
    render();
    announce('시뮬레이션을 시작했습니다.');
  } catch {
    announce('시뮬레이션을 시작하지 못했습니다. 다시 시도해 주세요.');
  }
}

function changeSessionState(action) {
  if (action === 'complete') currentSession.status = 'completed';
  if (action === 'pause') currentSession.status = 'paused';
  if (action === 'resume') currentSession.status = 'active';
  if (['complete', 'abandon'].includes(action)) {
    currentSession.status = action === 'abandon' ? 'abandoned' : 'completed';
    currentSession.endedAt = new Date().toISOString();
  }
  if (action === 'pause') currentSession.pausedAt = new Date().toISOString();
  saveSession(currentSession, browserStorage());
  render();
}

async function boot() {
  currentScenario = await loadScenario();
  const id = getStoredSessionId();
  if (id) currentSession = loadSession(id, browserStorage());
  if (currentSession) {
    currentSession = reconcileRequests(currentSession);
    saveSession(currentSession, browserStorage());
    render();
  }
  document.querySelector('#start-button').addEventListener('click', start);
  document.querySelector('#pause').addEventListener('click', () => changeSessionState('pause'));
  document.querySelector('#resume').addEventListener('click', () => changeSessionState('resume'));
  document.querySelector('#complete-session').addEventListener('click', () => changeSessionState('complete'));
  document.querySelector('#abandon').addEventListener('click', () => changeSessionState('abandon'));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !currentSession) return;
    currentSession = reconcileRequests(currentSession);
    saveSession(currentSession, browserStorage());
    render();
  });
  document.querySelector('#notify').addEventListener('click', async () => {
    if (!('Notification' in window)) return announce('이 브라우저에서는 시스템 알림을 사용할 수 없습니다.');
    const permission = await Notification.requestPermission();
    announce(permission === 'granted' ? '시스템 알림을 허용했습니다.' : '알림 없이도 앱 안에서 요청을 확인할 수 있습니다.');
  });
}

if (typeof document !== 'undefined') boot().catch(() => announce('서비스를 불러오지 못했습니다.'));
