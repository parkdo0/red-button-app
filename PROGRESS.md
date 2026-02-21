# 레드버튼 인증 시스템 구현 진행 상황

## Phase 1: DB 스키마 + 시드 데이터
- [x] Step 1-1: schema.prisma 수정 (storeCode, setupCode 추가, tabletPin 제거)
- [x] Step 1-2: 마이그레이션 실행
- [x] Step 1-3: seed.ts 수정 (storeCode, loginId, setupCode, bcrypt 비밀번호)
- [x] Step 1-4: 시드 실행 + 빌드 검증

## Phase 2: 인증 API 수정 (setupCode 방식)
- [x] Step 2-1: /api/auth/login — 테이블 로그인을 setupCode 방식으로
- [x] Step 2-2: /api/auth/tables — setupCode 검증 API로 변경
- [x] Step 2-3: /api/auth/stores — storeCode 포함 반환
- [x] Step 2-4: /api/auth/logout — 현행 확인

## Phase 3: 로그인 페이지 UI 수정
- [x] Step 3-1: 테이블 탭 → 매장 셀렉트 + 코드 4자리 입력 방식
- [x] Step 3-2: 테스트 안내 수정

## Phase 4: 고객 페이지 하드코딩 제거 (7개 파일)
- [x] Step 4-1: 세션 헬퍼 함수 (requireTableSession, requireAdminSession)
- [x] Step 4-2: app/page.tsx
- [x] Step 4-3: app/search/page.tsx
- [x] Step 4-4: app/order/page.tsx
- [x] Step 4-5: app/orders/page.tsx
- [x] Step 4-6: app/games/[id]/page.tsx
- [x] Step 4-7: app/chat/page.tsx
- [x] Step 4-8: app/info/page.tsx

## Phase 5: 클라이언트 컴포넌트 하드코딩 제거
- [x] Step 5-1: SessionProvider 컨텍스트 생성
- [x] Step 5-2: layout.tsx에 SessionProvider 감싸기
- [x] Step 5-3: OrderCartPanel.tsx 수정
- [x] Step 5-4: ChatClient.tsx 확인 (하드코딩 없음)

## Phase 6: 관리자 페이지 하드코딩 제거
- [x] Step 6-1: admin/store/page.tsx
- [x] Step 6-2: admin/store/orders/page.tsx
- [x] Step 6-3: admin/store/tables/page.tsx
- [x] Step 6-4: admin/store/games/page.tsx
- [x] Step 6-5: admin/store/menus/page.tsx
- [x] Step 6-6: admin/store/settings/page.tsx (API 로딩 추가)
- [x] Step 6-7: admin/store/chat/page.tsx (MOCK 데이터, storeId 없음 → 스킵)
- [x] Step 6-8: admin/layout.tsx — 매장명 동적 표시

## Phase 7: API 라우트 세션 검증
- [x] Step 7-1: /api/orders 세션 검증 (POST: 세션에서 storeId/tableId 추출, GET: 인증 검증)
- [x] Step 7-2: 고객용 API (chat GET/POST, sessions POST, sessions/active GET, sessions/[id] PATCH)
- [x] Step 7-3: 관리자용 API (dashboard/store, tables, store-games GET/POST/DELETE, store-menus GET/POST/DELETE, orders/[id] PATCH)
- [x] Step 7-4: 빌드 검증 성공

## Phase 8: 세션 만료 + 폴링 + 만료 화면
- [x] Step 8-1: 세션 만료 시간 7일 → 16시간 (auth.ts)
- [x] Step 8-2: SessionProvider 폴링 추가 (5분 간격)
- [x] Step 8-3: SessionExpiredOverlay 만료 화면 컴포넌트
- [x] Step 8-4: 빌드 검증 성공

## Phase 9: 설정 코드 발급/재발급
- [x] Step 9-1: 코드 생성 유틸리티 (src/lib/setup-code.ts)
- [x] Step 9-2: 코드 API (GET /api/tables — setupCode 반환, PATCH /api/tables/[id] — regenerateCode)
- [x] Step 9-3: 테이블 관리 UI에 코드 표시 + 재발급 버튼

## Phase 10: 최종 검증
- [ ] Step 10-1: 전체 빌드
- [ ] Step 10-2: E2E 검증
- [ ] Step 10-3: PROGRESS.md 완료
