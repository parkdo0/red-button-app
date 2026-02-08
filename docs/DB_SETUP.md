# DB 세팅 가이드

## 사전 조건
- MySQL 8.x 설치 및 실행 중
- Node.js v20.19+ (현재 설치됨)

## 1. MySQL에 데이터베이스 생성

```sql
CREATE DATABASE IF NOT EXISTS red_button
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
```

## 2. .env 파일 수정

```
# 본인 MySQL 계정에 맞게 수정
DATABASE_URL="mysql://root:비밀번호@localhost:3306/red_button"
```

## 3. Prisma 마이그레이션

```powershell
npx prisma migrate dev --name init
```

성공 시 `prisma/migrations/` 폴더에 SQL 파일이 생성됨.

## 4. 시드 데이터 삽입

```powershell
npx prisma db seed
```

성공 시 아래 데이터가 생성됨:
- 매장 1개 (레드버튼 강남점) + 테이블 6개
- 게임 카테고리 5개 + F&B 카테고리 3개
- 태그 12개 (인원수 3, 장르 5, 테마 4)
- 보드게임 8개 (태그 연결 완료)
- F&B 메뉴 10개 (옵션 그룹 + 옵션 항목 포함)

## 5. Prisma Studio (DB 확인용)

```powershell
npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속하여 데이터 확인 가능.

## 트러블슈팅

### 마이그레이션 실패 시
```powershell
# DB 초기화 후 재시도
npx prisma migrate reset
```

### Prisma Client 타입 에러 시
```powershell
npx prisma generate
```
