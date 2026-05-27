# 📋 PM-BOQ Enterprise - Backend Setup Guide

## 🎯 Deskripsi Sistem

PM-BOQ Enterprise adalah aplikasi manajemen proyek dengan fitur BOQ (Bill of Quantities) yang lengkap. Backend ini dibangun dengan:

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL dengan Prisma ORM
- **Port**: 5000 (default)
- **Frontend**: React di port 3000

---

## 📦 Prerequisites (Yang Harus Diinstall)

Pastikan Anda sudah menginstal:

1. **Node.js** (v16 atau lebih baru)
   - Download: https://nodejs.org/
   - Verifikasi: `node --version` dan `npm --version`

2. **PostgreSQL** (v12 atau lebih baru)
   - Download: https://www.postgresql.org/download/
   - Pastikan PostgreSQL service berjalan

3. **Git** (optional, untuk clone repository)
   - Download: https://git-scm.com/

---

## 🚀 Step-by-Step Setup

### Step 1: Navigasi ke Folder Backend

```bash
cd Backend
```

### Step 2: Install Dependencies

```bash
npm install
```

Ini akan menginstall semua package yang dibutuhkan:
- express
- cors
- dotenv
- prisma
- @prisma/client
- exceljs
- nodemon (dev)

### Step 3: Setup Database

#### 3a. Buat Database PostgreSQL

```bash
# Buka PostgreSQL CLI (psql)
psql -U postgres

# Jalankan command berikut:
CREATE DATABASE pm_boq;
\q
```

Atau menggunakan GUI tools seperti pgAdmin.

#### 3b. Konfigurasi Environment Variables

1. Copy file `.env.example` ke `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` dan sesuaikan dengan konfigurasi PostgreSQL Anda:
   ```
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/pm_boq?schema=public"
   FRONTEND_URL=http://localhost:3000
   ```

   **Ganti `PASSWORD` dengan password PostgreSQL Anda!**

#### 3c. Generate Prisma Client

```bash
npm run prisma:generate
```

#### 3d. Push Schema ke Database

```bash
npm run prisma:db-push
```

### Step 4: Seed Database (Optional - untuk data sample)

```bash
npm run prisma:seed
```

Ini akan membuat:
- 4 sample users (admin, PM, supervisor, client)
- 1 sample project
- 10+ master komponen BOQ
- 1 sample BOQ dengan items
- Project milestones & tasks
- S-Curve progress logs

---

## ▶️ Menjalankan Backend Server

### Development Mode (dengan auto-reload)

```bash
npm run dev
```

Server akan berjalan di `http://localhost:5001` (PORT dari .env script)

### Production Mode

```bash
npm start
```

Server akan berjalan di port yang ditentukan di `.env` (default: 5000)

### Verifikasi Server Berjalan

1. Buka browser dan kunjungi:
   - **Health Check**: `http://localhost:5000/health`
   - **API Info**: `http://localhost:5000/api/info`

2. Anda akan melihat response JSON jika server berhasil berjalan

---

## 📡 API Endpoints

### Projects
```
GET    /api/projects              - Daftar semua projects
GET    /api/projects/:id          - Detail project
POST   /api/projects              - Buat project baru
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Hapus project
```

### Master Komponen (BOQ Library)
```
GET    /api/master-komponen              - Daftar master komponen
GET    /api/master-komponen/:id          - Detail komponen
GET    /api/master-komponen/kode/:kode   - Cari berdasarkan kode
POST   /api/master-komponen              - Buat komponen baru
POST   /api/master-komponen/bulk/create  - Bulk create komponen
PUT    /api/master-komponen/:id          - Update komponen
DELETE /api/master-komponen/:id          - Hapus komponen
```

### BOQ (Bill of Quantities)
```
GET    /api/boq/list/all                      - Daftar semua BOQ
GET    /api/boq/details/:id                   - Detail BOQ
GET    /api/boq/by-project/:projectId         - BOQ untuk project tertentu
POST   /api/boq/create                        - Buat BOQ baru
PUT    /api/boq/update/:id                    - Update BOQ
DELETE /api/boq/delete/:id                    - Hapus BOQ
GET    /api/boq/export/project/:projectId     - Export BOQ ke Excel
```

### Tasks
```
GET    /api/tasks                 - Daftar tasks
GET    /api/tasks/:id             - Detail task
POST   /api/tasks                 - Buat task
PUT    /api/tasks/:id             - Update task
DELETE /api/tasks/:id             - Hapus task
```

### Milestones
```
GET    /api/milestones            - Daftar milestones
POST   /api/milestones            - Buat milestone
PUT    /api/milestones/:id        - Update milestone
```

---

## 📋 Contoh Request/Response

### 1. Membuat Project Baru

**Request:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Renovasi Gedung A",
    "clientName": "PT Maju Jaya",
    "location": "Jakarta Pusat",
    "budget": 2000000000,
    "startDate": "2026-06-01",
    "endDate": "2026-12-31",
    "description": "Renovasi lengkap gedung A"
  }'
```

**Response:**
```json
{
  "message": "Project created successfully",
  "data": {
    "id": "uuid-12345",
    "name": "Renovasi Gedung A",
    "clientName": "PT Maju Jaya",
    "budget": "2000000000.00",
    "status": "IN_PROGRESS",
    ...
  }
}
```

### 2. Membuat Master Komponen

**Request:**
```bash
curl -X POST http://localhost:5000/api/master-komponen \
  -H "Content-Type: application/json" \
  -d '{
    "kode": "PG-005",
    "namaKomponen": "Dinding Bata Merah Putih",
    "satuan": "m2",
    "hargaSatuan": 155000,
    "tipe": "PERANGKAT"
  }'
```

### 3. Membuat BOQ Baru

**Request:**
```bash
curl -X POST http://localhost:5000/api/boq/create \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-uuid",
    "namaBoq": "BOQ Fase 1 - Struktur",
    "keterangan": "BOQ untuk pekerjaan struktur beton bertulang",
    "items": [
      {
        "masterKomponenId": "komponen-uuid-1",
        "volume": 150,
        "hargaSatuan": 185000,
        "keterangan": "Partisi gypsum ruang kantor"
      },
      {
        "masterKomponenId": "komponen-uuid-2",
        "volume": 200,
        "hargaSatuan": 95000,
        "keterangan": "Plafond gypsum"
      }
    ]
  }'
```

### 4. Export BOQ ke Excel

**Request:**
```bash
curl -X GET http://localhost:5000/api/boq/export/project/project-uuid \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  --output BOQ_Project_Name.xlsx
```

---

## 🔗 Integrasi dengan Frontend

Frontend React harus mengakses backend dengan URL:

```javascript
const API_URL = 'http://localhost:5000/api';

// Contoh fetch ke projects
fetch(`${API_URL}/projects`)
  .then(res => res.json())
  .then(data => console.log(data));
```

**CORS Sudah Dikonfigurasi** untuk `http://localhost:3000`, jadi tidak ada blocking CORS error.

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- ✅ Pastikan PostgreSQL service running
- ✅ Cek `.env` DATABASE_URL sudah benar
- ✅ Pastikan database `pm_boq` sudah dibuat

### Error: "Port 5000 already in use"
- ✅ Ubah PORT di `.env`
- ✅ Atau matikan process yang menggunakan port 5000

### Error: "prisma: command not found"
- ✅ Run: `npm install`
- ✅ Run: `npx prisma generate`

### Excel Export Tidak Bekerja
- ✅ Pastikan folder `/Backend/exports` ada (akan auto-create)
- ✅ Cek permissions folder exports

---

## 📝 Development Notes

### File Structure
```
Backend/
├── config/              # Database config
├── controllers/         # Business logic
│   ├── projectController.js
│   ├── boqController.js
│   ├── masterKomponenController.js
│   └── ...
├── routes/              # API routes
│   ├── projectRoutes.js
│   ├── boqRoutes.js
│   ├── masterKomponenRoutes.js
│   └── ...
├── models/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Sample data
├── utils/               # Helper functions
├── middleware/          # Custom middleware
├── server.js            # Main entry point
├── package.json
└── .env                 # Environment variables
```

### Database Schema
- **User**: Manajemen user dengan roles (ADMIN, PM, SUPERVISOR, STAFF, CLIENT_VIEWER)
- **Project**: Info proyek (nama, klien, budget, lokasi, timeline)
- **MasterKomponen**: Library komponen BOQ yang bisa di-reuse
- **BOQ**: Dokumen BOQ master untuk proyek
- **BOQItemDetail**: Detail item dalam BOQ
- **Task**: Task/pekerjaan dalam proyek
- **ProjectMilestone**: Milestone tahap proyek (Inisiasi, Tender, Finansial, Eksekusi, BAUT)

---

## ✅ Checklist Sebelum Production

- [ ] Database PostgreSQL production sudah setup
- [ ] `.env` sudah dikonfigurasi dengan benar
- [ ] `NODE_ENV=production` di `.env`
- [ ] CORS origin sudah update ke frontend URL yang benar
- [ ] Password database sudah di-hash (jika ada user seeding)
- [ ] Error logging sudah setup
- [ ] Database backup strategy sudah ada
- [ ] Monitoring & alerting sudah setup

---

## 🤝 Support

Jika mengalami issues:

1. Cek console log server untuk error messages
2. Cek `.env` configuration
3. Verifikasi database connection
4. Cek query Prisma di `schema.prisma`

---

**Dibuat untuk PM-BOQ Enterprise v1.0** ✨
