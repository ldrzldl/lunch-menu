# AGENTS.md 초안

## 프로젝트 개요

- Node.js 20 이상을 사용하는 순수 JavaScript 프로젝트입니다.
- 프런트엔드는 `src/`에 있으며 빌드 시 `dist/`로 복사됩니다.
- Vercel 서버 함수 진입점은 `api/recommend.js`이고, 추천 로직은 `server/recommend.cjs`에 있습니다.
- 견종 데이터는 `src/data/breeds.js`에서 관리합니다.

## 디렉터리 구조

```text
src/
  index.html       # 화면 구조
  app.js           # 설문 상태, 점수 계산, API 호출, 화면 갱신
  styles.css       # 화면 스타일
  data/breeds.js   # 견종 데이터
api/
  recommend.js     # Vercel 요청 어댑터
server/
  recommend.cjs   # 후보 검증, LLM 호출, fallback
test/
  recommend.test.js
```

## 실행과 검증

```bash
npm test          # Node 내장 테스트
npm run build     # src/를 dist/로 복사
npm start         # 로컬 서버
```

변경 후에는 관련 테스트를 먼저 실행하고, 화면이나 배포 구성을 바꿨다면 `npm run build`도 실행합니다.

## 코드 작성 규칙

### 한국어 주석과 사용자 문구

- 주석과 사용자에게 보이는 문구는 한국어로 작성합니다.
- 주석은 코드만 보고 의도를 알기 어려운 부분에만 작성합니다. 코드 내용을 그대로 번역하는 주석은 쓰지 않습니다.
- 에러 메시지와 fallback 문구도 기존 사용자 언어인 한국어를 유지합니다.

### 함수 분리

- 함수 하나는 하나의 책임만 갖도록 합니다.
- DOM 렌더링, 입력 검증, 점수 계산, API 통신, 응답 정규화를 한 함수에 섞지 않습니다.
- 이미 있는 `targetProfile`, `scoreBreed`, `handleRecommend` 같은 경계를 재사용합니다.
- 호출부가 한 곳뿐인 짧은 로직은 별도 함수로 만들지 않습니다.
- 새 추상화·팩토리·설정 계층은 실제 중복이나 변경 요구가 생길 때만 추가합니다.

### 데이터와 검증

- 브라우저 입력과 API 요청은 신뢰하지 말고 서버에서 다시 검증합니다.
- 추천 결과는 후보 목록 안의 견종만 반환해야 합니다.
- 외부 API가 실패해도 현재처럼 결정적 fallback을 제공하고, 비밀키는 브라우저 코드에 노출하지 않습니다.
- 견종 데이터의 필드 의미와 점수 범위를 바꾸면 관련 계산 함수와 테스트를 함께 수정합니다.

## 변경 범위

- 기능 변경은 필요한 파일만 수정합니다.
- `dist/`, `.vercel/`, 비밀키 파일은 커밋하지 않습니다.
- 의존성 추가 전 Node 표준 기능이나 현재 설치된 코드로 해결할 수 있는지 확인합니다.
- 커밋 전 `git diff`, `npm test`, 필요한 경우 `npm run build`를 확인합니다.
