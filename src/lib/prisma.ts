import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client 싱글톤 인스턴스
 * Next.js HMR로 인한 PrismaClient 중복 생성 방지
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
