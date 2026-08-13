import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (typeof window === "undefined") {
  let dbUrl = 'file:./dev.db';
  
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV) {
    // Copy the database to /tmp on Vercel so it can be written to
    const tmpPath = '/tmp/dev.db';
    try {
      if (!fs.existsSync(tmpPath)) {
        fs.copyFileSync(path.join(process.cwd(), 'dev.db'), tmpPath);
      }
      dbUrl = `file:${tmpPath}`;
    } catch (e) {
      console.error("Failed to copy database to /tmp", e);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    const adapter = new PrismaBetterSqlite3({ url: dbUrl });
    prisma = new PrismaClient({ adapter });
  } else {
    if (!globalForPrisma.prisma) {
      const adapter = new PrismaBetterSqlite3({ url: dbUrl });
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    prisma = globalForPrisma.prisma;
  }
}

export { prisma };
