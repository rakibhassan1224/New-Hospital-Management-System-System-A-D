import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (typeof window === "undefined") {
  let dbUrl = 'file:./dev.db';
  
  if (process.env.NODE_ENV === 'production') {
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

  process.env.DATABASE_URL = dbUrl;

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
