import { handleRecommend } from '../server/recommend.cjs';

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'POST만 지원합니다.' });
  try {
    const body = typeof request.body === 'string' ? JSON.parse(request.body || '{}') : request.body || {};
    const result = await handleRecommend(body);
    return response.status(result.status).json(result.body);
  } catch {
    return response.status(500).json({ error: '추천 요청을 처리하지 못했습니다.' });
  }
}
