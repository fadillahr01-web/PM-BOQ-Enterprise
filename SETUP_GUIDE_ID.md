# 📋 PANDUAN SETUP LENGKAP PM-BOQ ENTERPRISE
## Integrasi Frontend, Backend, & Database

**Tanggal**: May 27, 2026  
**Versi**: 1.0  
**Status**: Production Ready

---

## 🎯 RINGKASAN DIAGNOSTIK

### ✅ Komponen Yang Sudah Benar
- ✓ Backend CORS sudah dikonfigurasi untuk `http://localhost:3000`
- ✓ Express server properly configured dengan middleware lengkap
- ✓ Prisma schema complete dengan semua models (Users, Projects, BOQ, Tasks, etc)
- ✓ Database foreign keys sudah properly set up
- ✓ API endpoints semua sudah defined:
  - `/api/projects` - Project Management
  - `/api/tasks` - Task Management
  - `/api/boq` - Bill of Quantities
  - `/api/master-komponen` - Master Data (Perangkat/Jasa)
  - `/api/auth` - Authentication
  - `/api/milestones` - Milestone Tracking
  - `/api/s-curve` - S-Curve Progress

### ⚠️ Masalah Yang Ditemukan & Solusi

| Masalah | Penyebab | Solusi |
|---------|---------|--------|
| Frontend tidak bisa fetch ke backend | Frontend .env tidak ada URL API backend | ✓ Sudah dibuat `.env.local` |
| Database belum terkoneksi | PostgreSQL tidak running atau DATABASE_URL salah | Lihat langkah setup |
| Seed data belum ada | `prisma:seed` belum dijalankan | Lihat langkah setup |

---

## 🚀 LANGKAH-LANGKAH SETUP LENGKAP

### **LANGKAH 1: Persiapan & Prerequisites**

Pastikan sudah install:
- **Node.js** v18+ (check: `node --version`)
- **PostgreSQL** 14+ (check: `psql --version`)
- **npm** v9+ (check: `npm --version`)
- **Git** (optional)

**Cek Install:**
```powershell
node --version
npm --version
psql --version
```

---

### **LANGKAH 2: Setup Database PostgreSQL**

#### 2.1 Start PostgreSQL Service (Windows)
```powershell
# Jika PostgreSQL sudah installed sebagai service, cek:
Get-Service postgresql*

# Jika belum running, start:
Start-Service postgresql-x64-15
# atau gunakan pgAdmin untuk manage
```

#### 2.2 Create Database
```powershell
# Masuk ke PostgreSQL CLI
psql -U postgres

# Di dalam psql, jalankan:
CREATE DATABASE pm_boq;
CREATE USER pm_user WITH PASSWORD 'pm_password';
ALTER ROLE pm_user SET client_encoding TO 'utf8';
ALTER ROLE pm_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE pm_user SET default_transaction_deferrable TO on;
ALTER ROLE pm_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE pm_boq TO pm_user;

# Keluar dari psql
\q
```

#### 2.3 Verifikasi Koneksi
```powershell
# Test koneksi ke database
psql -U pm_user -d pm_boq -h localhost -c "SELECT NOW();"
# Output: Tanggal & time jika berhasil
```

---

### **LANGKAH 3: Setup Backend**

#### 3.1 Navigate ke Backend Folder
```powershell
cd c:\Users\fadil\Downloads\PM-BOQ-Enterprise\Backend
```

#### 3.2 Install Dependencies
```powershell
npm install
# Tunggu sampai selesai (akan install prisma, express, cors, dll)
```

#### 3.3 Konfigurasi Environment
Backend `.env` sudah ada dengan konfigurasi default. Jika perlu custom, edit:
```powershell
# File: Backend\.env
PORT=5000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pm_boq?schema=public"
NODE_ENV=development
```

**Catatan:** Sesuaikan `DATABASE_URL` dengan koneksi PostgreSQL anda jika berbeda.

#### 3.4 Setup Prisma & Database Schema
```powershell
# Generate Prisma Client
npm run prisma:generate

# Push schema ke database (create tables)
npm run prisma:db-push
# Konfirmasi dengan 'y' jika ditanya

# Seed database dengan data default
npm run prisma:seed
# Tunggu sampai selesai - akan create users, projects, tasks, boq, dll
```

**Expected Output:**
```
✓ Successfully connected to database
✓ Created all tables
✓ Seeding database...
✓ RBAC Users seeded successfully
✓ Project created: Pembangunan Office Interior Toko Pedpedia
```

#### 3.5 Verifikasi Seed Data (Optional)
```powershell
# Di PostgreSQL, check data yang di-seed:
psql -U postgres -d pm_boq

# Di dalam psql:
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Project";
SELECT COUNT(*) FROM "Task";

\q
```

#### 3.6 Start Backend Server
```powershell
# Terminal baru atau di folder Backend:
npm start

# Expected output:
# 🚀 PM-BOQ Enterprise Backend Server is running on port 5000
# 📍 Health Check: http://localhost:5000/health
# 📍 API Info: http://localhost:5000/api/info
```

**Sekarang backend berjalan di `http://localhost:5000`** ✓

---

### **LANGKAH 4: Setup Frontend**

#### 4.1 Navigate ke Frontend Folder (Terminal Baru)
```powershell
cd c:\Users\fadil\Downloads\PM-BOQ-Enterprise\Frontend
```

#### 4.2 Install Dependencies
```powershell
npm install
# Tunggu sampai selesai
```

#### 4.3 Verifikasi .env.local
```powershell
# File: Frontend\.env.local sudah ada dengan:
# NEXT_PUBLIC_API_URL=http://localhost:5000
# NEXT_PUBLIC_ENV=development

# Jika belum ada, manual buat atau check:
cat .env.local
```

#### 4.4 Build Next.js (Optional, untuk production)
```powershell
# Skip ini jika hanya test development
npm run build
# Jika ada error, address dulu sebelum lanjut
```

#### 4.5 Start Frontend Development Server
```powershell
# Terminal baru atau di folder Frontend:
npm run dev

# Expected output:
# ▲ Next.js 14.2.3
# - Ready in 2.3s
# - Local: http://localhost:3000
# - Environments: .env.local
```

**Sekarang frontend berjalan di `http://localhost:3000`** ✓

---

### **LANGKAH 5: Verifikasi Koneksi Integration**

#### 5.1 Test Backend Endpoints
Buka browser atau gunakan curl:

```powershell
# 1. Health Check Backend
Invoke-WebRequest -Uri "http://localhost:5000/health" -UseBasicParsing | ConvertTo-Json

# 2. API Info
Invoke-WebRequest -Uri "http://localhost:5000/api/info" -UseBasicParsing | ConvertTo-Json

# 3. Get All Projects
Invoke-WebRequest -Uri "http://localhost:5000/api/projects" -UseBasicParsing | ConvertTo-Json

# 4. Get All Master Komponen
Invoke-WebRequest -Uri "http://localhost:5000/api/master-komponen" -UseBasicParsing | ConvertTo-Json
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-27T...",
  "message": "Backend server is running"
}
```

#### 5.2 Test Frontend + Backend Integration
1. **Buka browser**: `http://localhost:3000`
2. **Login** dengan credentials yang di-seed:
   - **Email**: `pm@project.com`
   - **Password**: `PM123`
   - Role: PROJECT_MANAGER
3. **Navigate ke Projects** - seharusnya tampil data dari backend
4. **Check Console Browser** (F12) - tidak boleh ada error CORS atau fetch failed

#### 5.3 Debugging Jika Ada Masalah

**Error: "Failed to fetch / CORS error"**
```
→ Pastikan backend running di port 5000
→ Check CORS middleware di Backend/server.js (line 18-21)
→ Pastikan Frontend mengakses dari http://localhost:3000 (bukan 127.0.0.1 atau localhost:3000:/)
```

**Error: "Cannot GET /api/projects"**
```
→ Backend routes tidak terdaftar
→ Jalankan: npm run prisma:generate
→ Restart backend server
```

**Error: "Database connection failed"**
```
→ PostgreSQL tidak running
→ DATABASE_URL di .env salah
→ Koneksi string format: postgresql://user:password@host:port/database
```

---

## 📋 STRUKTUR LENGKAP ENDPOINTS API

### **Projects API**
```
GET    /api/projects                 - Get all projects
GET    /api/projects/:id             - Get project by ID
POST   /api/projects                 - Create new project
PUT    /api/projects/:id             - Update project
DELETE /api/projects/:id             - Delete project
```

### **Tasks API**
```
GET    /api/tasks                    - Get all tasks
GET    /api/tasks/:id                - Get task by ID
POST   /api/tasks                    - Create new task
PUT    /api/tasks/:id                - Update task
DELETE /api/tasks/:id                - Delete task
```

### **BOQ API**
```
GET    /api/boq/list/all             - Get all BOQ documents
GET    /api/boq/by-project/:projectId - Get BOQ by project
GET    /api/boq/details/:id          - Get BOQ details
POST   /api/boq/create               - Create new BOQ
PUT    /api/boq/update/:id           - Update BOQ
DELETE /api/boq/delete/:id           - Delete BOQ
GET    /api/boq/export/project/:projectId - Export BOQ to Excel
```

### **Master Komponen (Master Data) API**
```
GET    /api/master-komponen          - Get all master komponen
GET    /api/master-komponen/:id      - Get by ID
GET    /api/master-komponen/kode/:kode - Get by kode
POST   /api/master-komponen          - Create komponen
POST   /api/master-komponen/bulk/create - Bulk create
PUT    /api/master-komponen/:id      - Update komponen
DELETE /api/master-komponen/:id      - Delete komponen
```

### **Milestones API**
```
GET    /api/milestones               - Get all milestones
POST   /api/milestones               - Create milestone
```

### **Auth API**
```
POST   /api/auth/login               - Login user
POST   /api/auth/logout              - Logout
POST   /api/auth/register            - Register user
```

---

## 🗄️ DATABASE SCHEMA OVERVIEW

### **Core Tables**
- **User** - Users dengan RBAC (Admin, PM, Supervisor, Staff, Client)
- **Project** - Project master dengan budget, timeline, progress
- **ProjectMember** - Relasi user-project
- **Task** - Tasks dalam project
- **SubTask** - Sub-tasks dari task
- **ProjectMilestone** - Milestone tracking
- **ProgressLog** - Progress history

### **BOQ Tables**
- **BOQ** - BOQ document master
- **BOQItemDetail** - Items dalam BOQ
- **BoqCategory** - Category untuk BOQ items (grouping)
- **BoqItem** - Detail items dengan volume, harga, progress

### **Master Data Tables**
- **MasterKomponen** - Reusable komponen (Perangkat/Jasa) dengan harga satuan
- **Material** - Material/Perangkat
- **Service** - Jasa/Service

### **Foreign Keys & Relationships**
```
Project ─→ ProjectMember ─→ User
      ├→ Task ─→ SubTask
      ├→ BOQ ─→ BOQItemDetail ─→ MasterKomponen
      ├→ ProjectMilestone ─→ User
      └→ Document
```

---

## ⚙️ ENVIRONMENT VARIABLES

### **Backend (.env)**
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pm_boq?schema=public
```

### **Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
```

---

## 🧪 TESTING CHECKLIST

- [ ] PostgreSQL running & database `pm_boq` exists
- [ ] Backend dependencies installed (`npm install` di Backend/)
- [ ] Prisma schema pushed (`npm run prisma:db-push`)
- [ ] Database seeded (`npm run prisma:seed`)
- [ ] Backend server running (`npm start` - port 5000)
- [ ] Backend health check OK (`http://localhost:5000/health`)
- [ ] Frontend dependencies installed (`npm install` di Frontend/)
- [ ] Frontend .env.local configured dengan API_URL
- [ ] Frontend dev server running (`npm run dev` - port 3000)
- [ ] Login page accessible (`http://localhost:3000/login`)
- [ ] Can login dengan user seed (pm@project.com / PM123)
- [ ] Projects page shows data from backend
- [ ] Browser console no CORS errors
- [ ] API calls successful (check Network tab F12)

---

## 🆘 TROUBLESHOOTING GUIDE

### **Problem: "Cannot connect to database"**
**Solusi:**
1. Cek PostgreSQL running: `Get-Service postgresql*`
2. Verify DATABASE_URL di .env
3. Test koneksi: `psql -U postgres`
4. Jalankan: `npm run prisma:db-push`

### **Problem: "CORS error / Failed to fetch"**
**Solusi:**
1. Pastikan backend di `http://localhost:5000` (bukan 5001 atau port lain)
2. Check Frontend mengakses dari `http://localhost:3000` (exact)
3. Verify CORS middleware di `Backend/server.js` line 18-21
4. Restart kedua server (backend & frontend)

### **Problem: "404 Not Found pada API endpoints"**
**Solusi:**
1. Verify route definition di `Backend/routes/*.js`
2. Jalankan: `npm run prisma:generate`
3. Restart backend
4. Test endpoint dengan curl: `Invoke-WebRequest http://localhost:5000/api/projects`

### **Problem: "Port already in use (EADDRINUSE)"**
**Solusi:**
```powershell
# Kill process on port 5000 (backend)
$port = 5000
$process = Get-Process | Where-Object {$_.Handles -like "*$port*"}
Stop-Process -Id $process.Id -Force

# Atau kill port 3000 (frontend)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### **Problem: "Prisma Client not found"**
**Solusi:**
```powershell
cd Backend
npm run prisma:generate
npm install
```

---

## 📱 AKUN TEST DEFAULT

| Email | Password | Role | Status |
|-------|----------|------|--------|
| admin@project.com | Admin123 | ADMIN | ✓ Seeded |
| pm@project.com | PM123 | PROJECT_MANAGER | ✓ Seeded |
| siti@pmboq.com | Supervisor123 | SUPERVISOR | ✓ Seeded |
| client@client.com | Client123 | CLIENT_VIEWER | ✓ Seeded |

---

## 🎓 NEXT STEPS (Setelah Setup Sukses)

1. **Implement Authentication**: Auth middleware, JWT tokens
2. **Add Frontend API Helpers**: Create API client utility
3. **Add Validation**: Input validation di frontend & backend
4. **Error Handling**: Global error handling & user-friendly messages
5. **Testing**: Unit tests, integration tests
6. **Deployment**: Configure untuk staging/production

---

## 📞 KONTAKT & SUPPORT

Jika ada issue atau pertanyaan, check:
- Backend logs: Terminal di mana backend running
- Frontend logs: Browser console (F12)
- Database logs: PostgreSQL logs
- Swagger docs: Jika sudah implement (belum ada)

---

**Status: Ready for Development** ✓

Last Updated: May 27, 2026
