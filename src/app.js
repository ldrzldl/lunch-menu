const form = document.querySelector('#recommendation-form');
const modeInputs = [...document.querySelectorAll('input[name="mode"]')];
const locationFields = document.querySelector('#location-fields');
const locationStatus = document.querySelector('#location-status');
const status = document.querySelector('#status');
const resultList = document.querySelector('#result-list');
const resultsTitle = document.querySelector('#results-title');
const refreshButton = document.querySelector('#refresh');
const clearButton = document.querySelector('#clear-filters');
let coordinates;
let lastRequest;

function mode() {
  return document.querySelector('input[name="mode"]:checked').value;
}

function setStatus(message, kind = '') {
  status.textContent = message;
  status.className = `status ${kind}`;
}

function requestLocation() {
  coordinates = undefined;
  if (!navigator.geolocation) {
    locationStatus.textContent = '이 브라우저에서는 위치를 사용할 수 없어요. 동네를 입력하세요.';
    return;
  }
  locationStatus.textContent = '현재 위치를 확인하고 있어요…';
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      coordinates = { latitude: coords.latitude, longitude: coords.longitude };
      locationStatus.textContent = '현재 위치를 사용해 주변 식당을 찾습니다.';
    },
    () => { locationStatus.textContent = '위치를 사용할 수 없어요. 동네나 주소를 입력하세요.'; }
  );
}

function setMode(nextMode) {
  locationFields.hidden = nextMode !== 'restaurant';
  document.querySelector('#max-distance').disabled = nextMode !== 'restaurant';
  if (nextMode === 'restaurant') requestLocation();
}

function numberOrUndefined(value) {
  return value === '' ? undefined : Number(value);
}

function buildRequest() {
  const selectedMode = mode();
  const request = {
    mode: selectedMode,
    category: document.querySelector('#category').value.trim() || undefined,
    maxPrice: numberOrUndefined(document.querySelector('#max-price').value),
    maxDistance: selectedMode === 'restaurant' ? numberOrUndefined(document.querySelector('#max-distance').value) : undefined,
    dietTags: document.querySelector('#diet').value.split(',').map((value) => value.trim()).filter(Boolean),
    excludedIds: lastRequest?.excludedIds ?? []
  };
  if (selectedMode === 'restaurant') {
    const area = document.querySelector('#area').value.trim();
    request.location = { ...(coordinates ?? {}), ...(area ? { area } : {}) };
  }
  return request;
}

function renderResults(items) {
  resultsTitle.hidden = false;
  resultList.replaceChildren();
  if (!items.length) {
    setStatus('조건에 맞는 메뉴가 없어요. 조건을 지우거나 다시 시도해 보세요.', 'empty');
    return;
  }
  setStatus(`${items.length}개의 메뉴를 찾았어요.`);
  for (const item of items) {
    const article = document.createElement('article');
    article.className = 'result-card';
    article.dataset.id = item.id;
    article.innerHTML = `<h3></h3><p class="meta"></p><p class="reason"></p>`;
    article.querySelector('h3').textContent = item.name;
    article.querySelector('.meta').textContent = [item.category, item.price ? `${item.price.toLocaleString()}원` : '', item.distance ? `${item.distance}km` : ''].filter(Boolean).join(' · ');
    article.querySelector('.reason').textContent = item.reason;
    resultList.append(article);
  }
  refreshButton.hidden = false;
}

async function recommend(request) {
  setStatus('메뉴를 찾고 있어요…');
  refreshButton.hidden = true;
  try {
    const response = await fetch('/api/recommend', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(request) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || '추천에 실패했어요.');
    renderResults(body.items);
  } catch (error) {
    setStatus(error.message || '추천에 실패했어요. 다시 시도해 주세요.', 'error');
  }
}

for (const input of modeInputs) input.addEventListener('change', () => setMode(mode()));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  lastRequest = buildRequest();
  recommend(lastRequest);
});
refreshButton.addEventListener('click', () => {
  if (!lastRequest) return;
  const shownIds = [...resultList.querySelectorAll('article')].map((article) => article.dataset.id).filter(Boolean);
  recommend({ ...lastRequest, excludedIds: [...new Set([...(lastRequest.excludedIds ?? []), ...shownIds])] });
});
clearButton.addEventListener('click', () => {
  for (const selector of ['#category', '#max-price', '#max-distance', '#diet']) document.querySelector(selector).value = '';
  document.querySelector('#area').value = '';
  lastRequest = undefined;
  setStatus('조건을 지웠어요.');
});

setMode(mode());
