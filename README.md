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

---

## 시스템 아키텍처

<p align="center">
  <img src="docs/architecture-overview.svg" alt="시스템 아키텍처 개요" width="100%" />
</p>

핵심은 **하나의 Next.js 앱**이 3가지 역할(고객/매장관리자/본사관리자)을 모두 처리한다는 것입니다. URL 경로와 JWT 세션의 role 값으로 역할을 구분하고, Middleware가 모든 요청을 가로채서 권한을 확인합니다.

### 데이터 흐름 — 두 가지 패턴

| 패턴 | 경로 | 사용처 | 장점 |
|------|------|--------|------|
| **A. Server Component 직접 조회** | `page.tsx → queries.ts → Prisma → MySQL` | 홈, 검색, 주문, 채팅, 이벤트 | API 왕복 없음, 번들 작음, 빠름 |
| **B. Client → API Route** | `Client → api.ts → axios → /api/* → Prisma` | 주문 생성, 채팅 전송, 상태 변경 | 사용자 인터랙션 처리, 세션 검증 |

### 루트 레이아웃 Provider 계층

```
<SessionProvider>          ← 세션 상태 관리 (5분 폴링, 만료 시 오버레이)
  <ToastProvider>          ← 토스트 알림
    <CartProvider>         ← 장바구니 (페이지 이동해도 유지)
      <Navigation />       ← 좌측 사이드바 (고객 페이지에서만)
      <main>{children}</main>
    </CartProvider>
  </ToastProvider>
</SessionProvider>
```

---

## 인증 플로우

<p align="center">
  <img src="docs/auth-flow.svg" alt="인증 플로우" width="100%" />
</p>

### 관리자 로그인

1. 아이디 + 비밀번호 입력
2. `POST /api/auth/login { type: "admin" }` → DB에서 AdminUser 조회 → `bcrypt.compare()` 검증
3. 역할 결정: `HQ_ADMIN` / `STORE_ADMIN`
4. JWT 토큰 생성 (jose, HS256, 16시간 만료) → httpOnly Cookie 저장
5. 리다이렉트: `/admin/hq` 또는 `/admin/store`

### 테이블 설정

매장 오픈 시 **직원이 각 태블릿에 1회 설정**. 고객은 세팅된 태블릿을 바로 사용.

1. 매장 선택 + 4자리 설정코드 입력 (예: `31AA`)
2. setupCode 조합: 매장접두사(`SW`) + 입력코드(`31AA`) = `SW31AA`
3. `POST /api/auth/login { type: "table" }` → DB에서 Table 조회
4. JWT 생성: `{ role: "TABLE", storeId, tableNo, tableId }` → 리다이렉트: `/`

### Middleware 역할 기반 라우트 보호

모든 요청에서 Edge Runtime으로 JWT 검증 후 역할 확인:

| 경로 | 허용 역할 |
|------|-----------|
| `/admin/hq/*` | `HQ_ADMIN`만 |
| `/admin/store/*` | `STORE_ADMIN`, `HQ_ADMIN` |
| `/`, `/search`, `/order`, `/chat`... | `TABLE`, `HQ_ADMIN` |
| `/login`, `/api/auth/*` | 공개 (인증 불필요) |

### 보안 설계

- **httpOnly Cookie**: JavaScript로 토큰 접근 불가 (XSS 방어)
- **sameSite: lax**: CSRF 방어
- **세션 기반 데이터 추출**: API Route에서 클라이언트가 보낸 storeId/tableId 무시, 쿠키 JWT에서만 추출
- **bcryptjs**: 비밀번호 해시 저장
- **16시간 토큰 만료**: SessionProvider가 만료 감지 → 오버레이 표시

---

## 주문 플로우 & 트랜잭션

<p align="center">
  <img src="docs/order-flow.svg" alt="주문 플로우" width="100%" />
</p>

### 고객 측 흐름

1. **페이지 로드**: Server Component → `getMenus(storeId)` → Menu + StoreMenu(매장별 가격/품절) + OptionGroup 조회
2. **메뉴 클릭**: 옵션 없으면 바로 장바구니, 있으면 OptionModal → 옵션 선택
3. **장바구니**: `CartProvider.addItem()` — cartId = `menuId:옵션조합` (같은 메뉴+다른 옵션 = 별도 항목)
4. **주문 확인**: OrderConfirmModal → PaymentWaitingModal → 결제 수단 선택
5. **API 호출**: `orderApi.create()` → `POST /api/orders`

### 서버 측 트랜잭션 (`prisma.$transaction`)

```
1. Order 생성 (totalPrice: 0)
2. 각 item → Menu 조회 → 존재/활성 검증
3. 옵션 조회 + 가격 계산: (basePrice + 옵션합) × quantity
4. ★ OrderItem 생성 (menuName, basePrice 스냅샷 저장)
5. ★ OrderItemOption 생성 (optionName, extraPrice 스냅샷 저장)
6. Order.totalPrice 업데이트
→ 어느 단계에서든 실패 시 전체 롤백
```

### 스냅샷 패턴

주문 시점의 메뉴명과 가격을 OrderItem/OrderItemOption에 복사 저장합니다. 나중에 메뉴명을 바꾸거나 가격을 올려도, 이미 생성된 주문 기록의 금액은 변하지 않습니다.

### 매장 관리자: 칸반 보드

```
PENDING → CONFIRMED → PREPARING → COMPLETED
                   └→ CANCELLED (어디서든 취소 가능)
```

`POST /api/orders/{id} { status }` → 낙관적 업데이트로 즉시 UI 반영

---

## 실시간 채팅 (SSE)

<p align="center">
  <img src="docs/realtime-chat-flow.svg" alt="실시간 채팅 아키텍처" width="100%" />
</p>

### 구조

- **전송**: `POST /api/chat` (HTTP 요청)
- **수신**: `GET /api/chat/stream` (SSE — Server-Sent Events)
- **서버**: `ReadableStream` + 1.5초 폴링 + 30초 heartbeat

### 고객 측

1. `new EventSource(/api/chat/stream?storeId=1&tableNo=31)` → SSE 연결
2. 메시지 전송 시 **낙관적 업데이트**: 즉시 화면에 표시(tempId) → POST 후 실제 ID로 교체
3. `seenIds`로 SSE 중복 메시지 필터링

### 관리자 측

1. `?storeId=1` (tableNo 없음) → **전체 테이블 메시지** 수신
2. **스레드 요약** Raw SQL: 각 테이블별 lastMessage, unread 수 계산
3. 미읽음 수 → 사이드바 뱃지 실시간 표시

### 왜 WebSocket 대신 SSE?

- 전송(POST) + 수신(SSE) 분리 → 단방향 스트리밍이면 SSE 충분
- Next.js Route Handler만으로 구현 (별도 서버 불필요)
- Vercel 서버리스 환경 호환
- EventSource 자동 재연결 내장

---

## DB 스키마 (23 모델)

<p align="center">
  <img src="docs/db-schema.svg" alt="DB 스키마 관계도" width="100%" />
</p>

### 핵심 설계 패턴

| 패턴 | 설명 | 적용 |
|------|------|------|
| **본사-매장 오버라이드** | 본사 마스터 + 매장별 커스텀, LEFT JOIN 병합 | Game↔StoreGame, Menu↔StoreMenu |
| **주문 스냅샷** | 주문 시점의 이름/가격 복사 저장, 원본 변경 영향 없음 | OrderItem, OrderItemOption |
| **태그 M:N + 복합 필터** | 같은 group=OR, 다른 group=AND | GameTag, Prisma `where.AND` |

### 관계 구조

```
Store ──1:N── Table ──1:N── TableSession
  │                  └──1:N── Order ──1:N── OrderItem ──1:N── OrderItemOption
  │
  ├──1:N── StoreGame ──N:1── Game ──1:N── GameTag ──N:1── Tag
  │                            └──1:N── GameHashtag
  │
  ├──1:N── StoreMenu ──N:1── Menu ──N:1── Category
  │                            └──1:N── MenuOptionGroup ──1:N── MenuOption
  │
  ├──1:N── ChatMessage · AdminUser
  └──1:N── CouponUsage ──N:1── Coupon

Event · Feedback · RecommendCategory ──1:N── RecommendCategoryItem
```

---

## 주요 기능

### 고객 태블릿

- **게임 추천** — 넷플릭스 스타일 카테고리별 가로 스크롤, 태그 기반 추천
- **게임 검색** — 이름(초성 포함) 검색, 장르/인원/난이도/시간 필터링 (클라이언트 사이드)
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
- **주문 관리** — 칸반 보드, 실시간 주문 상태 변경
- **카운터 쪽지** — SSE 실시간 채팅, 테이블별 스레드, 미읽음 뱃지
- **직원 호출** — 테이블별 호출 알림 관리
- **테이블 관리** — 세션 시작/종료, 상태 모니터링
- **게임 노출** — 매장별 게임 노출 여부, 진열 위치 관리
- **메뉴 관리** — 매장별 메뉴 활성화/비활성화, 가격 오버라이드
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

---

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
│   │       ├── orders/           # 주문 관리 (칸반)
│   │       ├── chat/             # 카운터 쪽지 (SSE)
│   │       ├── tables/           # 테이블 관리
│   │       ├── games/            # 게임 노출
│   │       ├── menus/            # 메뉴 관리
│   │       └── settings/         # 매장 설정
│   │
│   ├── api/                      # REST API (25개 엔드포인트)
│   │   ├── auth/                 # 로그인, 로그아웃, 세션
│   │   ├── chat/                 # 채팅 CRUD + SSE 스트림
│   │   ├── games/, menus/, orders/, ...
│   │   ├── coupons/              # 쿠폰 검증/사용
│   │   ├── feedback/             # 고객 의견
│   │   └── upload/               # 이미지 업로드
│   │
│   └── login/                    # 통합 로그인 페이지
│
├── components/
│   ├── cart/                     # 장바구니 (Provider, Bar, Panel, Modal)
│   ├── admin/                    # 관리자 전용 컴포넌트
│   ├── Navigation.tsx            # 고객 좌측 네비게이션
│   ├── SessionProvider.tsx       # 인증 세션 Context (5분 폴링)
│   ├── CartProvider.tsx          # 장바구니 Context (루트 배치)
│   ├── ToastProvider.tsx         # 토스트 알림
│   └── ...
│
├── lib/
│   ├── prisma.ts                 # Prisma Client 싱글톤 (HMR 중복 방지)
│   ├── auth.ts                   # JWT 생성/검증 (jose), 세션 헬퍼
│   ├── api.ts                    # 도메인별 API 객체 (gameApi, orderApi, chatApi...)
│   ├── axios.ts                  # Axios 인스턴스 + 에러 인터셉터
│   └── queries.ts                # Server Component용 DB 쿼리 함수
│
├── data/                         # 상수 (카테고리, 메뉴 탭 등)
└── types/                        # TypeScript 타입 정의
```

---

## API 엔드포인트

### 인증

| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/api/auth/login` | 관리자/테이블 통합 로그인 |
| POST | `/api/auth/logout` | 로그아웃 (쿠키 삭제) |
| GET | `/api/auth/session` | 세션 정보 조회 |
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
| POST | `/api/orders` | 주문 생성 (트랜잭션) |
| GET | `/api/orders` | 주문 목록 |
| PATCH | `/api/orders/[id]` | 주문 상태 변경 |
| POST | `/api/orders/[id]/payment` | 결제 처리 |

### 실시간 채팅

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/chat` | 채팅 메시지 조회 |
| POST | `/api/chat` | 메시지 전송 |
| GET | `/api/chat/stream` | SSE 실시간 스트림 (1.5s 폴링) |

### 기타

| Method | Path | 설명 |
| --- | --- | --- |
| GET/POST | `/api/coupons` | 쿠폰 검증/생성 |
| POST | `/api/feedback` | 고객 의견 제출 |
| POST | `/api/upload` | 이미지 업로드 |
| GET | `/api/dashboard/hq` | 본사 대시보드 데이터 |
| GET | `/api/dashboard/store` | 매장 대시보드 데이터 |

---

## 기술 결정 이유

| 결정 | 이유 |
|------|------|
| **jose** (JWT) | Edge Runtime(Middleware) 호환. NextAuth는 OAuth 중심이라 커스텀 로그인(매장코드+설정코드)에 부적합 |
| **SSE** (채팅) | 단방향 수신이면 충분. Next.js Route Handler만으로 구현. WebSocket 서버 불필요 |
| **Prisma Transaction** | 주문 생성 시 원자성 보장. 중간 실패 시 전체 롤백 |
| **Context API** (장바구니) | 외부 상태 라이브러리 불필요. 루트 레이아웃 배치로 페이지 이동 시에도 유지 |
| **Server/Client 분리** | Server Component로 직접 DB 쿼리(빠름), Client는 인터랙션만 담당(번들 축소) |
| **React 19 Compiler** | 자동 메모이제이션. useMemo/useCallback 수동 관리 불필요 |
| **클라이언트 사이드 필터링** | 게임 수백 개 수준이라 전체 로드 후 즉각 반응이 UX에 유리 |

---

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
SESSION_SECRET="your-secret-key"
```

### 시드 데이터

`npx prisma db seed` 실행 시 다음 데이터가 생성됩니다:

- 본사 관리자 계정 (`hq` / `admin1234`)
- 매장 관리자 계정 (`suwon` / `store1234`)
- 매장 2개 (수원점, 강남점) + 테이블
- 게임 약 40종 + 태그, 해시태그
- F&B 메뉴 + 옵션
- 추천 카테고리
- 이벤트, 쿠폰

## 빌드

```bash
npm run build   # 58 페이지 빌드
npm start       # 프로덕션 서버
```

## 라이선스

Private
