# CLAUDE.md — 시향노트 (SCENT NOTE)

> 이 파일은 Claude Code가 이 저장소에서 작업할 때 항상 먼저 읽는 규칙서입니다.
> 작업 전에 항상 docs/spec.md를 먼저 읽는다. spec.md는 내가 쓰는 문서라서 허락 없이 고치지 않는다.
> 중요한 결정이 생기면 docs/decisions.md에 날짜, 무엇을 정했는지, 왜 정했는지, 다른 선택지를 한 항목씩 기록한다.
> 디자인이 정해지거나 바뀌면 docs/design.md에 정리한다.
> 무엇을 만드는지는 `spec.md`, 왜 그렇게 정했는지는 `decisions.md`를 확인하세요.
- 기록은 작업이 끝날 때마다 알아서 한다.
- 큰 결정은 혼자 정하지 말고 나에게 먼저 물어본다.
- 파일과 폴더 이름은 영어 소문자와 하이픈으로 짓는다.
- .env는 절대 GitHub에 올리지 않고, API 키는 코드에 직접 쓰지 않는다.
---

## 1. 절대 규칙 (위반 금지)

1. **향수 정보를 지어내지 않는다.** 브랜드·향수 이름, 노트, 가격은 **사람이 공식 출처에서 확인해 넣은 값**(`src/data/perfumes.json`)만 쓴다. 없으면 `[확인 필요]`로 표시하고 임의로 채우지 않는다. (D-21: 향수 API 사용 안 함)
2. **API 키·비밀 키를 프런트엔드 코드에 넣지 않는다.** `.env.local`(로컬)과 Vercel 환경 변수에만 두고 `.env*`는 `.gitignore`에 포함한다. 단, Supabase `anon` 키(`VITE_SUPABASE_ANON_KEY`)는 브라우저에 노출돼도 되는 키이고 RLS로 보호한다. `service_role` 키는 어디에도 쓰지 않는다.
3. **향수 데이터는 커밋된 JSON만 읽는다.** 향수 정보를 실시간 외부 API로 가져오지 않는다. (박람회 당일 외부 서비스가 멈춰도 추천 기능은 돌아가야 함)
4. **향수병 이미지는 사람이 직접 구해 `public/perfumes/`에 파일로 저장해 쓴다.** (D-22) 다른 사이트 이미지를 핫링크하지 않고, 브랜드 로고는 쓰지 않는다. 이미지 출처는 향수별로 기록하고 화면에 출처를 표시한다. 이미지가 없거나 로드에 실패하면 향 계열 색 플레이스홀더로 대체한다. 이미지 저작권은 각 브랜드에 있으므로 박람회 이후 공개 운영 시 재검토한다.
5. **향수 정보(노트·설명 텍스트)를 웹사이트 스크래핑으로 가져오지 않는다.** (Fragrantica·Parfumo 등 이용약관 위반 소지) 데이터는 사람이 직접 확인한 값만. 이미지는 4번을 따른다.
6. **"구매 추천"이 아니라 "시향 후보 추천"이다.** 화면 문구에 "이 향수를 사세요", "구매하기", 쇼핑몰·구매 링크를 넣지 않는다. 결과는 항상 "맡아보세요"로 안내한다.
7. **가격은 반드시 출처·기준일과 함께 보여준다.** 국내 공식 정가(원, 사람이 확인)와 확인 날짜·출처를 함께 표시하고, 확인하지 못했으면 `[확인 필요]`로 둔다. 최저가·할인가 비교는 하지 않는다. "가격은 변동될 수 있어요" 문구를 항상 함께 표시한다.
8. **로그인 화면·회원가입을 만들지 않는다.** 시향 메모만 Supabase에 저장하며(D-23), 익명 로그인 + RLS로 본인 메모만 접근하게 한다. localStorage는 캐시·장애 대비로 함께 쓴다. 향수 데이터는 DB에 넣지 않는다. 컴포넌트는 Supabase를 직접 호출하지 않고 `lib/storage.ts`를 거친다.
9. **`spec.md`의 "이번에 하지 않는 것"에 있는 기능을 만들지 않는다.** (잔향 트래킹, 지도 API, 회원가입 등) 필요해 보이면 먼저 사용자에게 묻는다.
10. **디자인 토큰을 임의로 바꾸지 않는다.** 색·폰트·반경은 `src/styles/tokens.css`의 변수만 사용하고, 새 HEX 값을 컴포넌트에 직접 쓰지 않는다.
11. **밝은 향 계열 색(fill) 위에 흰 글자를 쓰지 않는다.** 색 글자는 `-deep` 변수, 흰 글자는 잉크(`--ink`) 배경 위에만.
12. **새 패키지를 설치하거나 API 요금제·호출 수가 늘어나는 작업 전에 사용자에게 먼저 묻는다.**
13. **비밀 키, 개인정보를 코드나 커밋에 넣지 않는다.**


---

## 2. 아키텍처

### 기술 스택
- **React 19 + Vite + TypeScript** (Vite 템플릿 기본 버전)
- **스타일:** Tailwind CSS v4(`@tailwindcss/vite`) + CSS 변수(`src/styles/tokens.css`). 색은 `src/styles/index.css`의 `@theme inline`에서 CSS 변수를 참조
- **라우팅:** `react-router-dom`
- **상태:** React `useState` / `useReducer` + Context (선택 상태 공유용). 별도 상태 라이브러리 없음
- **저장:** Supabase (시향 메모만, 익명 로그인 + RLS) + `localStorage` 캐시
- **향수 데이터:** 사람이 직접 입력한 `src/data/perfumes.json` (API 사용 안 함, D-21)
- **폰트:** Google Fonts — IBM Plex Sans KR (400·500·700), IBM Plex Mono (500)
- **배포:** Vercel

### 향수 데이터
```
src/data/perfumes.json   # 사람이 공식 출처에서 확인해 입력: 영문·한글 이름, 노트, 향 계열, 일상어 묘사, 국내 정가(기준일·출처), 이미지 파일 경로·출처
         ↓
src/lib/perfumes.ts      → 앱에서 쓰는 Perfume[]
```
- 확인하지 못한 값은 비워 두고 화면에 `[확인 필요]`로 표시한다. 이미지는 `public/perfumes/{id}.jpg` 등으로 저장한다.

### 폴더 구조
```
/
├─ CLAUDE.md · spec.md · decisions.md
├─ index.html              # Google Fonts link, <html lang="ko">
├─ src/
│  ├─ main.tsx · App.tsx    # 라우터
│  ├─ pages/
│  │  ├─ Home.tsx           # 시작 + 목적 선택 (나를 위한 / 선물할)
│  │  ├─ Select.tsx         # 느낌 카드 단계 (1~3단계, mode에 따라 질문 다름)
│  │  ├─ Result.tsx         # 시향 후보 3개 + 시향 순서 + 시향 팁
│  │  └─ Notes.tsx          # 내 시향 노트(메모 목록)
│  ├─ components/
│  │  ├─ Header.tsx         # 공통 상단 내비게이션 (로고 · 내 시향 노트 · 처음으로)
│  │  ├─ TastePanel.tsx     # Select 화면 오른쪽 '내 취향 노트' 실시간 요약 (모바일은 하단 바)
│  │  ├─ Chip.tsx           # 분위기 칩 / 향기 칩 / 피하고 싶은 칩
│  │  ├─ StepBar.tsx
│  │  ├─ ScentCard.tsx      # 시향 후보 카드 (앞면/뒷면 뒤집기)
│  │  ├─ ScentCardFront.tsx # 앞면: 향수 정보
│  │  ├─ ScentCardBack.tsx  # 뒷면: 노트·시향 가이드·버튼
│  │  ├─ NoteBar.tsx        # 탑·미들·베이스 색 막대
│  │  ├─ NoteDetail.tsx     # 노트별 성분 + 일상어 묘사
│  │  ├─ TipBox.tsx
│  │  ├─ ScentBand.tsx      # 향 계열 색 시향지 띠
│  │  └─ MemoSheet.tsx      # 메모 팝업: 별점 + 한 줄 메모 (모바일 아래 시트 / 데스크톱 중앙)
│  ├─ data/                 # scripts/xlsx-to-json.py가 docs/perfumes-draft.xlsx에서 생성
│  │  ├─ families.json      # 14개 향 계열 (id, 이름, 순서, 색 변수명)
│  │  ├─ chips.json         # 칩 목록과 향 계열/태그 매핑
│  │  ├─ tips.json          # 공통 시향 팁
│  │  └─ perfumes.json      # 향수 데이터 (사람이 직접 입력)
│  ├─ lib/
│  │  ├─ perfumes.ts        # perfumes.json 로드·검증 → Perfume[]
│  │  ├─ recommend.ts       # 추천 점수 계산·상위 3개·시향 순서 정렬
│  │  ├─ recommend.test.ts
│  │  ├─ price.ts           # 가격 표시 규칙 (국내 정가·기준일·출처)
│  │  ├─ supabase.ts        # Supabase 클라이언트 + 익명 로그인
│  │  ├─ storage.ts         # 메모 저장소: Supabase + localStorage 캐시 (try/catch)
│  │  └─ links.ts           # 네이버 지도 검색 링크 생성
│  ├─ types.ts
│  └─ styles/
│     ├─ tokens.css         # 디자인 토큰 (아래 6번)
│     └─ index.css
├─ .env.local               # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (커밋 금지)
├─ .env.example             # 키 이름만 (값 없이)
└─ public/                  # 파비콘, perfumes/ (향수병 이미지)
```

---

## 3. 빌드 · 테스트 · 배포

```bash
npm install          # 의존성 설치
npm run dev          # 개발 서버 (http://localhost:5173)
npm run build        # 프로덕션 빌드 → dist/
npm run preview      # 빌드 결과 로컬 확인
npm run test         # vitest: recommend.ts 로직 테스트
npm run lint         # oxlint
```

- **배포:** GitHub 저장소를 Vercel에 연결 → `main` 브랜치에 push하면 자동 배포.
  - Framework Preset: Vite / Build: `npm run build` / Output: `dist`
  - SPA 라우팅을 위해 루트에 `vercel.json` 추가: `{"rewrites":[{"source":"/(.*)","destination":"/"}]}`
  - Vercel 환경 변수에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`를 등록한다. (그 외 비밀 키는 넣지 않는다)
- **배포 URL은 한 번 정하면 바꾸지 않는다.** (박람회 제출 후 변경 불가) 프로젝트 이름을 바꾸거나 새 Vercel 프로젝트를 만들지 않는다.
- 작업을 마칠 때마다 `npm run build`가 에러 없이 끝나는지 확인한다.

---

## 4. 도메인 컨텍스트

### 서비스 한 줄
향수를 사거나 선물하려는 사람이 **좋아하는 느낌을 일상어 카드로 고르면, 맡아볼 향수 3개(시향 후보)와 맡는 순서, 각 향의 노트를 쉬운 말과 색으로** 알려 주는 반응형 웹 (데스크톱 우선).

### 용어
| 용어 | 뜻 |
|---|---|
| 시향 | 향수를 직접 맡아보는 것 |
| 시향 후보 | 우리가 추천하는 "맡아볼" 향수 3개. 구매 추천이 아님 |
| 시향 순서 | 가벼운 향 → 진한 향 순서. 향 계열 `order` 값 기준 정렬 |
| 노트 (Note) | 향수가 시간에 따라 펼쳐지는 단계. 탑(처음 10~30분) → 미들(30분~몇 시간) → 베이스(잔향) |
| 잔향 | 베이스 노트. 몇 시간 뒤 피부에 남는 향 |
| 향 계열 (family) | 14개 분류: 시트러스, 프루티, 아쿠아·오존, 그린, 아로마틱, 플로럴, 화이트 플로럴, 파우더리, 머스크·클린, 스파이시, 우디, 앰버, 구르망, 레더·스모키 |
| 분위기 칩 (mood) | 형용사: 차분한, 깨끗한, 시원한, 포근한 … |
| 향기 칩 (object) | 명사: 비누, 숲·나무, 바람·비, 과일 … → 향 계열과 1:1 또는 1:N 매핑 |
| 피하고 싶은 칩 (avoid) | 너무 단, 너무 진한, 머리 아픈 … → 향수의 `avoidFlags`와 매칭되면 제외 |
| 모드 (mode) | `self`(나를 위한) / `gift`(선물할) |
| 호불호 (polarizing) | `low`/`mid`/`high`. 선물 모드·"잘 모르겠어요"에서 `low` 우선 |
| 시향 메모 | 맡아본 향수에 남기는 별점 + 한 줄 메모. 추후 잔향 트래킹으로 확장 |
| 국내 정가 | 공식몰에서 확인한 원화 가격. 확인 날짜·출처와 함께 표시 |

### 데이터 흐름
```
perfumes.json → perfumes.ts → Perfume[]

Home(모드 선택)
  → Select: 칩 선택 → SelectionContext { mode, moods[], objects[], avoids[], unsure }
  → recommend(perfumes, selection)
       1) avoidFlags가 avoids와 겹치는 향수 제외
       2) 점수 = 향기 칩→계열 일치(×3) + 분위기 일치(×2) + (gift/unsure면 polarizing=low 가산)
       3) 상위 후보 중 향 계열이 겹치지 않게 3개 선택 (부족하면 겹침 허용)
       4) 3개를 family.order → intensity 순으로 정렬 = 시향 순서
       5) 각 결과에 matchedReasons(일치한 칩 이름) 첨부
  → Result: 3개 카드 + 시향 팁
  → MemoSheet 저장 → storage.ts → Supabase `memos` (+ localStorage "scentnote.memos.v1" 캐시)
  → Notes: 메모 목록
```
- 결과가 3개 미만이면 조건을 완화(분위기 가중치만)해서 채우고, "조건에 딱 맞는 향이 적어 비슷한 향을 함께 보여드려요" 안내.

---

## 5. 코딩 컨벤션

- **언어:** 화면 문구는 한국어, 해요체. 코드(변수·함수·파일명)는 영어.
- **네이밍:** 컴포넌트 `PascalCase.tsx`, 함수·변수 `camelCase`, 상수 `UPPER_SNAKE_CASE`, JSON 키 `camelCase`, 향 계열 id는 `citrus`, `fruity`, `aqua`, `green`, `aromatic`, `floral`, `whiteFloral`, `powdery`, `musk`, `spicy`, `woody`, `amber`, `gourmand`, `leather`.
- **컴포넌트:** 함수형 + TypeScript props 타입 명시. 한 파일 200줄을 넘기면 분리.
- **스타일:** Tailwind 유틸리티 + 토큰 변수. 인라인 HEX 금지.
- **반응형:** 데스크톱 우선으로 디자인하되 Tailwind 브레이크포인트로 대응 — 모바일 `<768`(기본), `md` 768+, `lg` 1024+. 콘텐츠 최대 너비 1120px 중앙 정렬. 모든 화면은 1280px과 390px 두 폭에서 확인한다.
- **접근성:** 칩·카드는 `<button>`(선택 상태는 `aria-pressed`), 링크는 `<a href>`, 입력에는 `<label>`. 터치 영역 44px 이상. 아이콘 버튼엔 `aria-label`.
- **모션:** 200ms ease-out. 결과 카드 60ms 간격 순차 등장, 노트 막대 채워짐, 카드 뒤집기 400ms. `prefers-reduced-motion`이면 끄고 뒤집기는 페이드로 대체.
- **뒤집기 카드:** 보이지 않는 면은 `aria-hidden` + `inert`. 앞·뒷면 높이 동일, 넘치는 내용은 카드 안 스크롤.
- **localStorage:** 반드시 `lib/storage.ts`를 통해서만, try/catch로 감싸고 실패해도 화면이 깨지지 않게.
- **이미지:** `<img loading="lazy" alt="[브랜드] [향수 이름] 병 이미지">`, `onError` 시 향 계열 색 플레이스홀더로 교체. 이미지 영역 크기를 고정해 레이아웃이 흔들리지 않게.
- **가격 표시:** 항상 `lib/price.ts`의 `formatPrice()`로만. 컴포넌트에서 가격 문자열을 직접 만들지 않는다.
- **커밋:** `타입: 요약` 형식, 한국어 요약 가능.
  - `feat:` 기능 / `fix:` 버그 / `style:` 디자인 / `data:` 향수·칩 데이터 / `docs:` 문서 / `refactor:` / `chore:`
  - 예: `feat: 결과 화면 시향 순서 정렬 추가`

---

## 6. 디자인 토큰 (`src/styles/tokens.css`)

```css
:root {
  --paper: #F8F6F3; --card: #FFFFFF; --mist: #F0EDF2; --line: #E3DFE6;
  --ink: #231F3A; --ink-deep: #17142A; --slate: #5A556B; --hint: #9A95A8;

  /* 향 계열: fill(막대·점) / tint(배경) / deep(색 글자). 번호 = 시향 순서 */
  --citrus: #F2C94C;      --citrus-tint: #FDF6DD;      --citrus-deep: #7A5D00;
  --fruity: #F49A84;      --fruity-tint: #FDECE7;      --fruity-deep: #8C3A24;
  --aqua: #7FB7D6;        --aqua-tint: #E7F2F8;        --aqua-deep: #235E7E;
  --green: #8CC08A;       --green-tint: #ECF5EA;       --green-deep: #2C6535;
  --aromatic: #6FB3A4;    --aromatic-tint: #E5F3F0;    --aromatic-deep: #22615A;
  --floral: #E8A0B4;      --floral-tint: #FBEAF0;      --floral-deep: #8F3550;
  --whiteFloral: #E2CDE3; --whiteFloral-tint: #F8F2F8; --whiteFloral-deep: #6E4A6C;
  --powdery: #C9B4E3;     --powdery-tint: #F3EEFA;     --powdery-deep: #5A4590;
  --musk: #B9C6E6;        --musk-tint: #EEF2FA;        --musk-deep: #3A4E85;
  --spicy: #D97B5C;       --spicy-tint: #F9E7E0;       --spicy-deep: #8A3418;
  --woody: #B48A6A;       --woody-tint: #F3ECE6;       --woody-deep: #5F4029;
  --amber: #E3A35E;       --amber-tint: #FBEEDF;       --amber-deep: #7D430D;
  --gourmand: #E6CFA6;    --gourmand-tint: #FAF4EA;    --gourmand-deep: #6E5530;
  --leather: #8E8494;     --leather-tint: #EDEBEE;     --leather-deep: #3D3542;

  --font-sans: 'IBM Plex Sans KR', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --r-chip: 999px; --r-btn: 14px; --r-card: 16px; --r-sheet: 24px;
  --shadow-float: 0 6px 20px rgba(35, 31, 58, 0.10);
}
```

**쓰는 법:** 잉크 = 글자·주요 버튼 / 향 계열 색 = 면(선택된 칩 배경, 결과 카드 배경, 상단 띠) / 노트 라벨·숫자 = Mono. 향수병 이미지는 카드 안 **향 계열 tint 배경 위**에 올려 색과 사진이 함께 보이게 한다.