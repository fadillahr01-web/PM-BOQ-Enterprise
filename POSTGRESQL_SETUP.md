# ⚠️ POSTGRESQL SETUP REQUIRED

## Status: PostgreSQL Service Not Found

Backend setup sudah **80% selesai**. Yang tersisa adalah mengatur PostgreSQL.

---

## 🔧 SETUP POSTGRESQL (PILIH 1)

### **OPTION A: Install PostgreSQL Baru (Recommended)**

1. **Download PostgreSQL Installer**
   - Kunjungi: https://www.postgresql.org/download/windows/
   - Download versi 14 atau lebih baru

2. **Jalankan Installer**
   - Next → Next
   - Password: `postgres` (remember this!)
   - Port: `5432` (default)
   - Locale: Leave default
   - Install

3. **Verifikasi Install**
   ```powershell
   psql --version
   ```

4. **Start PostgreSQL**
   ```powershell
   # Check if running
   Get-Service postgresql* | Select Status

   # If not running, start it
   Start-Service postgresql-x64-14
   # atau
   Start-Service postgresql-x64-15
   # (sesuaikan dengan versi yang terinstall)
   ```

---

### **OPTION B: PostgreSQL Sudah Installed (hanya tidak running)**

```powershell
# Cek service yang available
Get-Service postgresql*

# Start the service (ganti nomor versi sesuai installed)
Start-Service postgresql-x64-15
# atau
Start-Service postgresql-x64-14
```

---

### **OPTION C: Using PostgreSQL Docker (jika ada Docker)**

```powershell
docker run --name pm-boq-postgres ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=pm_boq ^
  -p 5432:5432 ^
  -d postgres:15
```

---

## ✅ VERIFIKASI POSTGRESQL RUNNING

```powershell
# Test connection
psql -U postgres -h localhost -c "SELECT NOW();"

# Should output: current date/time
# If error: PostgreSQL not running or wrong password
```

---

## 🚀 LANJUTKAN SETUP SETELAH POSTGRESQL RUNNING

Setelah PostgreSQL running, jalankan commands berikut:

```powershell
# 1. Push schema ke database
cd c:\Users\fadil\Downloads\PM-BOQ-Enterprise\Backend
npm run prisma:db-push

# 2. Seed database dengan test data
npm run prisma:seed

# 3. Restart backend
npm start
```

---

## 📝 DATABASE CREDENTIALS

```
Host: localhost
Port: 5432
Database: pm_boq
User: postgres
Password: postgres (atau yang anda set saat install)
```

**Sesuaikan di file**: `Backend/.env`
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pm_boq?schema=public"
```

---

## 🆘 TROUBLESHOOTING

**Error: "Can't reach database server"**
→ Pastikan PostgreSQL service running

**Error: "FATAL: password authentication failed"**
→ Cek password di .env, sesuaikan dengan yang set saat install

**Error: "database pm_boq does not exist"**
→ Database akan auto-created saat `npm run prisma:db-push`

---

## 📞 NEXT STEPS

1. **Install/Start PostgreSQL** ← DO THIS FIRST
2. Run: `npm run prisma:db-push`
3. Run: `npm run prisma:seed`
4. Run: `npm start` (Backend)
5. Run: `npm run dev` (Frontend - new terminal)
6. Open: http://localhost:3000

---

**Status**: Waiting for PostgreSQL ⏳

Last Updated: May 27, 2026
