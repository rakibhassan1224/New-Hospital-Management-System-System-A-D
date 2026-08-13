import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (typeof window === "undefined") {
  if (process.env.NODE_ENV === 'production') {
    // In production we would normally connect to a MySQL database directly without better-sqlite3
    // But for this prototype, we'll keep it as SQLite unless configured otherwise
    const db = new Database('./dev.db');
    const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
    prisma = new PrismaClient({ adapter });
  } else {
    if (!globalForPrisma.prisma) {
      const db = new Database('./dev.db');
      const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prisma = globalForPrisma.prisma;
  }
}

export { prisma };
