# GitHub와 Vercel 배포

## 1. Supabase 확인

Supabase 대시보드에서 `Authentication > Providers > Anonymous`를 켜고,
`supabase/migrations/20260714000000_create_dog_care_tables.sql` 내용을 SQL Editor에서
한 번 실행합니다. 앱에는 `publishable` 키만 사용합니다. `service_role` 키는 커밋하거나
브라우저 환경변수로 사용하지 않습니다.

## 2. GitHub에 커밋

```bash
git add .
git commit -m "Prepare Supabase app for Vercel deployment"
git push origin main
```

## 3. Vercel 연결

1. Vercel에서 **Add New > Project**를 선택합니다.
2. GitHub 저장소를 선택합니다.
3. Framework Preset은 **Other**로 둡니다.
4. Build Command는 `npm run build`, Output Directory는 `dist`로 둡니다.
5. **Deploy**를 누릅니다.

`vercel.json`에 위 설정이 이미 들어 있으므로 대부분 자동으로 채워집니다.

## 로컬 검증

```bash
npm test
npm run build
npm start
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다.
