# 🔴 레드버튼(RedButton) 태블릿 앱 클론

레드버튼 보드게임 카페의 실제 태블릿 앱 핵심 기능 3가지를 클론 코딩하는 프로젝트.

## 기술 스택

| Layer     | Tech                    |
| --------- | ----------------------- |
| Framework | Next.js 16 (App Router) |
| Language  | TypeScript              |
| Styling   | Tailwind CSS 4          |
| ORM       | Prisma 7                |
| DB        | MySQL 8                 |

## 구현 범위

### 1. 게임 찾기 (Search & Filter)
- 넷플릭스 스타일 가로 스크롤 추천 리스트
- 검색바 (게임명, 설명, 카테고리 검색)
- 사이드바 필터 (인원수, 장르, 난이도) → 실시간 필터링
- 모바일/태블릿 세로모드 필터 토글
- Game ↔ Tag M:N 관계

### 2. 게임 상세 (Detail & Video)
- 유튜브 영상 플레이어 + 게임 정보
- 태그 기반 관련 게임 추천
- 반응형 레이아웃 (가로: 2컬럼, 세로: 1컬럼)

### 3. F&B 주문 (Order System)
- 탭 메뉴 → 메뉴 카드 → 옵션 모달 → 장바구니 → 주문 확인 → 주문
- 옵션: 필수/선택, 단일/다중 선택, 수량 조절
- 장바구니: 우측 슬라이드 패널, 수량 변경/삭제/전체삭제
- 주문 내역 페이지 (상태별 뱃지)
- 토스트 알림 (주문 완료, 담기 완료)

## 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── games/          # GET /api/games, GET /api/games/:id
│   │   ├── menus/          # GET /api/menus
│   │   └── orders/         # GET/POST /api/orders
│   ├── games/[id]/         # 게임 상세
│   ├── order/              # F&B 주문
│   ├── orders/             # 주문 내역
│   ├── error.tsx           # 전역 에러 바운더리
│   ├── not-found.tsx       # 404 페이지
│   ├── loading.tsx         # 메인 로딩 스켈레톤
│   ├── layout.tsx          # 루트 레이아웃 (사이드 네비 + 토스트)
│   └── page.tsx            # 메인 (게임 찾기)
├── components/
│   ├── cart/
│   │   ├── CartProvider.tsx      # Context 장바구니 상태관리
│   │   ├── CartBar.tsx           # 하단 플로팅 바
│   │   ├── CartPanel.tsx         # 우측 슬라이드 패널
│   │   ├── OptionModal.tsx       # 옵션 선택 모달
│   │   └── OrderConfirmModal.tsx # 주문 확인 모달
│   ├── GameCard.tsx              # 게임 카드
│   ├── GameCategoryRow.tsx       # 카테고리별 가로 스크롤 행
│   ├── GameFilterSidebar.tsx     # 필터 사이드바 (반응형)
│   ├── Navigation.tsx            # 좌측 사이드 네비게이션
│   ├── Skeleton.tsx              # 로딩 스켈레톤 컴포넌트
│   ├── ToastProvider.tsx         # 토스트 알림 시스템
│   └── YoutubePlayer.tsx         # 유튜브 임베드 플레이어
├── data/
│   ├── mock.ts                   # Mock 데이터 (게임, 메뉴)
│   └── mock-orders.ts           # Mock 주문 내역
└── lib/
    └── prisma.ts                 # Prisma Client 싱글톤

prisma/
├── schema.prisma
└── seed.ts
```

## ERD (12 모델)

```
Store 1──N Table
  │           │
  └──N Order N┘
       │
       1──N OrderItem ──N OrderItemOption
              │                  │
              N                  N
              │                  │
            Menu ──1 MenuOptionGroup ──1 MenuOption
              │
              N
           Category (type: GAME | FOOD)
              │
              N
            Game ──M:N── Tag (via GameTag)
```

## 로컬 개발

```bash
# 1. 의존성 설치
npm install

# 2. Mock 데이터로 바로 실행 (DB 없이)
npm run dev

# 3. DB 연동 시 (MySQL 필요)
# .env의 DATABASE_URL을 로컬 MySQL에 맞게 수정
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## 라우트

| 경로 | 설명 |
| --- | --- |
| `/` | 게임 찾기 (검색 + 필터 + 카테고리별 리스트) |
| `/games/:id` | 게임 상세 (유튜브 + 정보 + 추천) |
| `/order` | F&B 주문 (탭 메뉴 + 옵션 모달 + 장바구니) |
| `/orders` | 주문 내역 (상태별 뱃지) |

## API 엔드포인트

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/games` | 게임 목록 (필터: playerCount, genre, difficulty, search) |
| GET | `/api/games/:id` | 게임 상세 + 관련 게임 |
| GET | `/api/menus` | F&B 메뉴 (필터: category) |
| POST | `/api/orders` | 주문 생성 (트랜잭션) |
| GET | `/api/orders` | 주문 목록 (필터: storeId, tableId, status) |

## 작업 진행

| Phase | 작업 | 상태 |
| ----- | --- | ---- |
| 1-1 | 프로젝트 초기화 (Next.js + TS + Tailwind) | ✅ |
| 1-2 | Prisma 스키마 설계 (12 모델) | ✅ |
| 1-3 | Seed 데이터 | ✅ |
| 1-4 | 전체 레이아웃 + 네비게이션 | ✅ |
| 2-1 | F&B 주문 API (메뉴 + 주문 CRUD) | ✅ |
| 2-2 | F&B 주문 UI (옵션모달 + 장바구니 + 주문확인) | ✅ |
| 2-3 | 게임 찾기 API + 필터 | ✅ |
| 2-4 | 게임 찾기 UI (검색 + 필터 사이드바) | ✅ |
| 2-5 | 게임 상세 (유튜브 + 추천) | ✅ |
| 2-6 | 주문 내역 페이지 | ✅ |
| 3-1 | 태블릿 반응형 + 터치 최적화 | ✅ |
| 3-2 | 에러 핸들링 / UX (토스트, 스켈레톤, 404) | ✅ |
