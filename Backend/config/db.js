const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// 1. Buat koneksi pool menggunakan pg driver bawaan node
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// 2. Masukkan pool ke dalam adapter Prisma
const adapter = new PrismaPg(pool);

// 3. Inisialisasi Prisma dengan adapter (Ini akan otomatis menggunakan WASM Engine)
const prisma = new PrismaClient({ adapter });

module.exports = prisma;