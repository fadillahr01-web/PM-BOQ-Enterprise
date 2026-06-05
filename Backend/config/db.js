const { PrismaClient } = require('@prisma/client');

let prisma;

// Reuse PrismaClient across hot-reloads in development / serverless warm starts
if (process.env.NODE_ENV === 'production') {
  try {
    const { Pool } = require('pg');
    const { PrismaPg } = require('@prisma/adapter-pg');

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,                    // limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  } catch (e) {
    console.warn('[db.js] pg adapter not available, using standard PrismaClient:', e.message);
    prisma = new PrismaClient();
  }
} else {
  // Development: reuse across hot-reloads
  if (!global.__prisma) {
    try {
      const { Pool } = require('pg');
      const { PrismaPg } = require('@prisma/adapter-pg');

      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const adapter = new PrismaPg(pool);
      global.__prisma = new PrismaClient({ adapter });
    } catch (e) {
      console.warn('[db.js] pg adapter not available, using standard PrismaClient:', e.message);
      global.__prisma = new PrismaClient();
    }
  }
  prisma = global.__prisma;
}

module.exports = { prisma };