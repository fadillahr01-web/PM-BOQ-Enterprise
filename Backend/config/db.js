const { PrismaClient } = require('@prisma/client');

// Inisialisasi Prisma standar tanpa adapter yang rumit
const prisma = new PrismaClient();

// Tes koneksi ringan saat server menyala
prisma.$connect()
  .then(() => console.log("✅ Berhasil terhubung ke Database!"))
  .catch((err) => console.error("❌ Gagal terhubung ke Database:", err));

module.exports = prisma;