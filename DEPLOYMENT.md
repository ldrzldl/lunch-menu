# GitHub와 Vercel 배포

멍BTI는 서버나 원격 추천 API 없이 브라우저에서 동작하는 결정적 조건 매칭 앱입니다.

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

브라우저에서 `http://localhost:3000`을 열어 확인합니다.
