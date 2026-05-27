## 🚀 QUICK START - Backend PM-BOQ Enterprise

### Langkah Cepat Menjalankan Backend

#### 1️⃣ Setup Database (FIRST TIME ONLY)

```bash
# Buka cmd/terminal di folder Backend
cd Backend

# Install dependencies
npm install

# Edit .env dengan DATABASE_URL yang benar:
# DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/pm_boq?schema=public"

# Push schema ke database
npm run prisma:db-push

# (Optional) Seed sample data
npm run prisma:seed
```

#### 2️⃣ Jalankan Server

**Development Mode** (dengan auto-reload):
```bash
npm run dev
```

**Production Mode**:
```bash
npm start
```

#### ✅ Verifikasi

Buka browser: `http://localhost:5000/health`

Anda harus melihat:
```json
{
  "status": "ok",
  "timestamp": "2026-05-25T...",
  "message": "Backend server is running"
}
```

---

### 📋 Database URL Examples

**Default (Local PostgreSQL)**:
```
postgresql://postgres:postgres@localhost:5432/pm_boq?schema=public
```

**Custom Username/Password**:
```
postgresql://username:password@localhost:5432/pm_boq?schema=public
```

**Remote PostgreSQL** (e.g., Heroku):
```
postgresql://user:pass@host.com:5432/database?schema=public
```

---

### 🧪 Test Endpoints (Postman / cURL)

#### Get All Projects
```bash
curl http://localhost:5000/api/projects
```

#### Get All Master Komponen
```bash
curl http://localhost:5000/api/master-komponen
```

#### Get All BOQs
```bash
curl http://localhost:5000/api/boq/list/all
```

#### Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "clientName": "Test Client",
    "location": "Jakarta",
    "budget": 1000000000,
    "startDate": "2026-06-01",
    "endDate": "2026-12-31"
  }'
```

#### Create Master Komponen
```bash
curl -X POST http://localhost:5000/api/master-komponen \
  -H "Content-Type: application/json" \
  -d '{
    "kode": "TEST-001",
    "namaKomponen": "Test Component",
    "satuan": "m2",
    "hargaSatuan": 100000,
    "tipe": "PERANGKAT"
  }'
```

---

### 🔧 Useful npm Commands

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Start development mode (auto-reload) |
| `npm start` | Start production mode |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:db-push` | Push schema to database |
| `npm run prisma:seed` | Seed sample data |

---

### 🎯 Default Sample Data (After Seeding)

**Users:**
- Email: `admin@project.com` / Password: `Admin123`
- Email: `pm@project.com` / Password: `PM123`
- Email: `siti@pmboq.com` / Password: `Supervisor123`
- Email: `client@client.com` / Password: `Client123`

**Project:**
- Name: "Pembangunan Office Interior Toko Pedpedia"
- Client: "Toko Pedpedia"
- Location: "Jakarta Selatan"
- Budget: 1.5 Billion IDR

**Master Komponens:**
- PG-001: Dinding Partisi Gypsum
- PG-002: Plafond Gypsum Board
- PG-003: Bongkaran Dinding
- LM-001: Lampu Downlight LED
- AC-001: AC Split 1.5 PK
- ... dan 5 lainnya

---

### ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Ubah PORT di `.env` atau kill process |
| Cannot connect to DB | Cek DATABASE_URL di `.env`, pastikan PG running |
| CORS Error | Sudah dikonfigurasi untuk `localhost:3000` |
| prisma: command not found | Run `npm install` & `npm run prisma:generate` |
| Excel export error | Folder `/exports` akan auto-create |

---

### 📞 Need Help?

Check `SETUP.md` untuk dokumentasi lengkap dan troubleshooting detail!

---

**Ready to go! 🎉**
