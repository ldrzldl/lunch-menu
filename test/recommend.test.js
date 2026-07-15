import test from 'node:test';
import assert from 'node:assert/strict';

const { handleRecommend } = await import('../server/recommend.cjs');

test('final review validates current-method candidates and falls back without a key', async () => {
  const invalid = await handleRecommend({ candidates: [{ name: '없는 견종' }] });
  assert.equal(invalid.status, 400);

  const result = await handleRecommend({ candidates: [{ name: '말티즈' }, { name: '비숑 프리제' }], subjective: { concerns: '털' } });
  assert.equal(result.status, 200);
  assert.equal(result.body.recommendation.breedName, '말티즈');
  assert.equal(result.body.fallback, true);
  assert.equal(result.body.searched, false);
});

test('final review follows the ReAct tool-call and observation loop', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  let chatCalls = 0;
  process.env.OPENAI_API_KEY = 'test-key';
  globalThis.fetch = async (url) => {
    if (url.endsWith('/chat/completions')) {
      chatCalls += 1;
      return new Response(JSON.stringify(chatCalls === 1
        ? { choices: [{ message: { role: 'assistant', content: null, tool_calls: [{ id: 'call-1', type: 'function', function: { name: 'web_search', arguments: '{"query":"말티즈 털 관리"}' } }] } }] }
        : { choices: [{ message: { role: 'assistant', content: JSON.stringify({ breedName: '말티즈', summary: '검색 후 판단', objectiveFit: ['조건'], subjectiveFit: ['상황'], cautions: ['확인'], sources: [] }) } }] }), { status: 200 });
    }
    return new Response(JSON.stringify({ output_text: '말티즈 털 관리 정보: 출처 확인 필요' }), { status: 200 });
  };
  try {
    const result = await handleRecommend({ candidates: [{ name: '말티즈' }], subjective: { concerns: '털' } });
    assert.equal(result.body.searched, true);
    assert.equal(result.body.recommendation.summary, '검색 후 판단');
    assert.equal(chatCalls, 2);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});
