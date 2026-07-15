# GitHub와 Vercel 배포

## 1. GitHub에 커밋

```bash
git add .
git commit -m "Prepare app for Vercel deployment"
git push origin main
```

## 2. Vercel 연결

1. Vercel에서 **Add New > Project**를 선택합니다.
2. GitHub 저장소를 선택합니다.
3. Framework Preset은 **Other**로 둡니다.
4. Build Command는 `npm run build`, Output Directory는 `dist`로 둡니다.
5. **Deploy**를 누릅니다.

`vercel.json`에 위 설정이 이미 들어 있으므로 대부분 자동으로 채워집니다.

## LLM 최종 추천 환경변수

Vercel Project Settings의 Environment Variables에 다음을 등록하고 새 배포를 생성합니다.

```text
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini       # 선택
OPENAI_WEB_SEARCH_TOOL=web_search_preview  # 선택
```

키는 `api/recommend.js` 서버 함수에서만 읽으며 브라우저로 전달하지 않습니다. 키가
없거나 OpenAI 요청이 실패하면 객관식 점수 기준 Top-5의 1순위 fallback을 반환합니다.

## 프로젝트에서 Vercel 관리

```bash
npm run vercel:login    # 최초 1회: 브라우저에서 Vercel 로그인
npm run vercel:link     # 현재 디렉터리를 Vercel 프로젝트에 연결
npm run vercel:preview  # 프리뷰 배포
npm run vercel:deploy   # 프로덕션 배포
npm run vercel:logs -- https://배포주소.vercel.app
```

`vercel:link` 실행 후 생성되는 `.vercel/`은 개인 프로젝트 연결 정보이므로
커밋하지 않습니다. GitHub 저장소가 Vercel 프로젝트에 연결되어 있다면 `main`
푸시만으로도 자동 배포되며, CLI 명령은 수동 프리뷰·프로덕션 배포와 로그 확인에
사용합니다.

## 로컬 검증

```bash
npm test
npm run build
npm start
```

포트 3000이 사용 중이면 `PORT=4177 npm start` 후
`http://localhost:4177`을 열어 확인합니다.
