# 🔴 레드버튼(Red Button) — 보드게임 카페 매장 운영 시스템

보드게임 카페 프랜차이즈 "레드버튼"의 통합 매장 운영 시스템.
고객용 태블릿 앱, 매장 관리자, 본사 관리자를 하나의 Next.js 앱으로 구현합니다.

## 기술 스택

| Layer     | Tech                           |
| --------- | ------------------------------ |
| Framework | Next.js 16 (App Router)        |
| Language  | TypeScript (strict)            |
| Styling   | Tailwind CSS 4                 |
| ORM       | Prisma 5                       |
| DB        | MySQL 8                        |
| Auth      | jose (JWT) + bcryptjs + Cookie |
| Realtime  | SSE (Server-Sent Events)       |

## 사용자 유형

| 유형 | 진입 경로 | 인증 방식 |
| --- | --- | --- |
| 고객 태블릿 | `/` | 매장 선택 + PIN + 테이블 번호 |
| 매장 관리자 | `/admin/store` | 아이디/비밀번호 로그인 |
| 본사 관리자 | `/admin/hq` | 아이디/비밀번호 로그인 |

## 주요 기능

### 고객 태블릿

- **게임 추천** — 넷플릭스 스타일 카테고리별 가로 스크롤, 태그 기반 추천
- **게임 검색** — 이름(초성 포함) 검색, 장르/인원/난이도/시간 필터링
- **게임 상세** — 유튜브 영상, 게임 정보, 관련 게임 추천
- **F&B 주문** — 카테고리 탭, 옵션 모달, 장바구니, 결제
- **카운터 쪽지** — SSE 실시간 양방향 채팅, 빠른 질문 버튼
- **이용 정보** — Wi-Fi, 이용 안내, 고객 의견 제출
- **이벤트** — 매장 이벤트/프로모션 조회
- **게임 키트** — 벌칙 룰렛, 선 정하기, 팀 정하기
- **쿠폰** — 쿠폰 코드 입력 및 사용
- **직원 호출** — 확인 모달 + 10초 쿨다운

### 매장 관리자

- **대시보드** — 오늘의 매출, 주문 수, 테이블 현황
- **주문 관리** — 실시간 주문 목록, 상태 변경
- **카운터 쪽지** — SSE 실시간 채팅, 테이블별 스레드, 빠른 답변
- **직원 호출** — 테이블별 호출 알림 관리
- **테이블 관리** — 세션 시작/종료, 상태 모니터링
- **게임 노출** — 매장별 게임 노출 여부 관리
- **메뉴 관리** — 매장별 메뉴 활성화/비활성화, 가격 조정
- **매장 설정** — 매장 기본 정보, Wi-Fi, 영업시간

### 본사 관리자

- **대시보드** — 전체 매장 매출 요약
- **게임 관리** — CRUD, 이미지 업로드, 유튜브 URL
- **메뉴 관리** — CRUD, 옵션 그룹, 이미지 업로드
- **추천 관리** — 추천 카테고리 및 게임 구성
- **이벤트 관리** — 이벤트 CRUD
- **태그 관리** — 게임 태그 CRUD
- **매장 현황** — 전체 매장 목록 및 상태
- **쿠폰 관리** — 쿠폰 생성/수정/비활성화
- **고객 의견** — 피드백 조회

## 프로젝트 구조

```
src/
├── app/
│   ├── (고객 페이지)
│   │   ├── page.tsx              # 게임 추천 (메인)
│   │   ├── search/               # 게임 검색
│   │   ├── games/[id]/           # 게임 상세
│   │   ├── order/                # F&B 주문
│   │   ├── orders/               # 주문 내역
│   │   ├── chat/                 # 카운터 쪽지 (SSE)
│   │   ├── info/                 # 이용 정보 + 고객 의견
│   │   ├── events/               # 이벤트
│   │   ├── kit/                  # 게임 키트
│   │   └── coupon/               # 쿠폰 사용
│   │
│   ├── admin/
│   │   ├── layout.tsx            # 관리자 공통 레이아웃
│   │   ├── hq/                   # 본사 관리자
│   │   │   ├── page.tsx          # 대시보드
│   │   │   ├── games/            # 게임 CRUD
│   │   │   ├── menus/            # 메뉴 CRUD
│   │   │   ├── recommend/        # 추천 관리
│   │   │   ├── events/           # 이벤트 관리
│   │   │   ├── tags/             # 태그 관리
│   │   │   ├── stores/           # 매장 현황
│   │   │   ├── coupons/          # 쿠폰 관리
│   │   │   └── feedback/         # 고객 의견
│   │   └── store/                # 매장 관리자
│   │       ├── page.tsx          # 대시보드
│   │       ├── orders/           # 주문 관리
│   │       ├── chat/             # 카운터 쪽지 (SSE)
│   │       ├── tables/           # 테이블 관리
│   │       ├── games/            # 게임 노출
│   │       ├── menus/            # 메뉴 관리
│   │       └── settings/         # 매장 설정
│   │
│   ├── api/                      # REST API (25개 엔드포인트)
│   │   ├── auth/                 # 로그인, 로그아웃, 세션
│   │   ├── chat/                 # 채팅 CRUD
│   │   │   └── stream/           # SSE 실시간 스트림
│   │   ├── games/, menus/, orders/, ...
│   │   ├── coupons/              # 쿠폰 검증/사용
│   │   ├── feedback/             # 고객 의견
│   │   └── upload/               # 이미지 업로드
│   │
│   └── login/                    # 통합 로그인 페이지
│
├── components/
│   ├── cart/                     # 장바구니 (Provider, Bar, Panel, Modal)
│   ├── admin/                    # 관리자 전용 컴포넌트 (GameForm)
│   ├── Navigation.tsx            # 고객 좌측 네비게이션
│   ├── SessionProvider.tsx       # 인증 세션 Context
│   ├── GameTimer.tsx             # 이용 시간 타이머
│   ├── StaffCallButton.tsx       # 직원 호출
│   ├── ToastProvider.tsx         # 토스트 알림
│   └── ...
│
├── lib/
│   ├── prisma.ts                 # Prisma Client 싱글톤
│   ├── auth.ts                   # JWT 인증 유틸
│   ├── api.ts                    # fetchApi / postApi 공통 함수
│   └── queries.ts                # DB 쿼리 함수
│
├── data/                         # 상수 (카테고리, 메뉴 탭 등)
└── types/                        # TypeScript 타입 정의
```

## DB 스키마 (24 모델)

```
AdminUser              — 관리자 계정 (HQ/STORE)
Store ──1:N── Table    — 매장, 테이블
            └── TableSession    — 테이블 이용 세션

Category ──1:N── Game  — 카테고리(GAME/FOOD), 게임
Game ──M:N── Tag       — 게임 ↔ 태그 (via GameTag)
Game ──1:N── GameHashtag
StoreGame              — 매장별 게임 노출

RecommendCategory ──1:N── RecommendCategoryItem  — 추천 그룹

Menu ──1:N── MenuOptionGroup ──1:N── MenuOption   — 메뉴, 옵션
StoreMenu              — 매장별 메뉴 설정

Order ──1:N── OrderItem ──1:N── OrderItemOption    — 주문

ChatMessage            — 채팅 메시지 (SSE 실시간)
Feedback               — 고객 의견
Coupon ──1:N── CouponUsage  — 쿠폰 및 사용 내역
Event                  — 이벤트/프로모션
```

## 로컬 개발

### 사전 요구사항

- Node.js 18+
- MySQL 8

### 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL 수정

# 3. DB 스키마 적용 + 시드 데이터
npx prisma db push
npx prisma db seed

# 4. 개발 서버 실행
npm run dev
```

### 환경 변수

```env
DATABASE_URL="mysql://root:root@localhost:3306/redbutton"
```

### 시드 데이터

`npx prisma db seed` 실행 시 다음 데이터가 생성됩니다:

- 본사 관리자 계정 (admin / admin)
- 매장 관리자 계정 (store1 / store1)
- 매장 2개 (수원점, 강남점) + 테이블
- 게임 약 40종 + 태그, 해시태그
- F&B 메뉴 + 옵션
- 추천 카테고리
- 이벤트, 쿠폰

## API 엔드포인트

### 인증

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/auth/login` | 관리자 로그인 |
| POST | `/api/auth/logout` | 로그아웃 |
| GET | `/api/auth/session` | 세션 정보 |
| GET | `/api/auth/stores` | 매장 목록 (태블릿 설정용) |
| POST | `/api/auth/tables` | 태블릿 테이블 설정 |

### 게임

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/games` | 게임 목록 (검색, 필터) |
| GET/PUT/DELETE | `/api/games/[id]` | 게임 상세/수정/삭제 |
| GET/POST | `/api/categories` | 카테고리 CRUD |
| GET/POST | `/api/tags` | 태그 CRUD |
| GET/POST | `/api/recommend` | 추천 카테고리 CRUD |

### 주문/메뉴

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/menus` | 메뉴 목록 (옵션 포함) |
| POST | `/api/orders` | 주문 생성 |
| GET | `/api/orders` | 주문 목록 |
| PATCH | `/api/orders/[id]` | 주문 상태 변경 |
| POST | `/api/orders/[id]/payment` | 결제 처리 |

### 실시간 채팅

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/chat` | 채팅 스레드/메시지 조회 |
| POST | `/api/chat` | 메시지 전송 |
| GET | `/api/chat/stream` | SSE 실시간 스트림 |

### 기타

| Method | Path | 설명 |
| --- | --- | --- |
| GET/POST | `/api/coupons` | 쿠폰 검증/생성 |
| POST | `/api/feedback` | 고객 의견 제출 |
| POST | `/api/upload` | 이미지 업로드 |
| GET | `/api/dashboard/hq` | 본사 대시보드 데이터 |
| GET | `/api/dashboard/store` | 매장 대시보드 데이터 |

## 빌드

```bash
npm run build   # 58 페이지 빌드
npm start       # 프로덕션 서버
```

## 라이선스

Private
