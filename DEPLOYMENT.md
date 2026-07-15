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

## Supabase migration 운영

Supabase CLI는 프로젝트에 개발 의존성으로 포함되어 있습니다. 프로젝트 루트에서
아래 명령을 실행합니다.

```bash
npm run supabase:login
npm run supabase:link
npm run supabase:status
```

처음 연결할 때는 `supabase:status`로 원격에 이미 적용된 migration을 먼저 확인합니다.
기존 migration을 SQL Editor에서 직접 실행했다면, 같은 migration이 이미 적용되어
있는지 확인하지 않고 `push`하지 않습니다.

새로운 테이블 구조 변경은 기존 파일을 수정하지 않고 새 migration으로 만듭니다.

```bash
npm run supabase:new -- add_description_to_sessions
npm run supabase:push
```

`supabase:push`는 아직 원격에 적용되지 않은 migration만 실행합니다. migration 파일은
반드시 GitHub에 커밋해 schema 변경 이력을 보존합니다.
