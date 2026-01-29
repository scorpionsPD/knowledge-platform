import { PrismaClient } from '@prisma/client';

const dbUrl =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/knowledge_platform';

export const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } }
});

export default prisma;
