const { PrismaClient } = require('@prisma/client');

// Singleton pattern for serverless environments (Vercel)
// Prevents creating multiple PrismaClient instances on hot-reload
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = { prisma };
