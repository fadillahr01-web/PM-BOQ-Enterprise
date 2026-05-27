# 🎯 PM-BOQ ENTERPRISE - MAIN README

![PM-BOQ Enterprise](https://via.placeholder.com/1200x300?text=PM-BOQ+ENTERPRISE+System)

**Sistem Pengurusan Projek & Bill of Quantities untuk Industri Konstruksi**

---

## 📋 Table of Contents

- [Ringkasan Projek](#ringkasan-projek)
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Folder](#struktur-folder)
- [Panduan Quick Start](#panduan-quick-start)
- [Setup Lengkap](#setup-lengkap)
- [API Endpoints](#api-endpoints)
- [Kontribusi](#kontribusi)

---

## 📊 Ringkasan Projek

**PM-BOQ ENTERPRISE** adalah aplikasi web full-stack untuk manajemen proyek dan Bill of Quantities (BOQ) dalam industri konstruksi. Aplikasi ini memungkinkan:

✅ **Pengurusan Proyek** - Track timeline, budget, progress  
✅ **Bill of Quantities** - Buat, kelola, dan export BOQ dalam format Excel  
✅ **Master Data** - Kelola perangkat dan jasa dengan harga satuan  
✅ **Task Management** - Assign tasks, track progress, milestone tracking  
✅ **Progress Tracking** - S-Curve analysis, timeline vs actual  
✅ **Role-Based Access** - Admin, PM, Supervisor, Staff, Client Viewer  
✅ **Multi-Project Support** - Handle multiple projects simultaneously  

---

## ⭐ Fitur Utama

### 🏗️ Project Management
- Create, read, update, delete projects
- Track budget vs actual cost
- Progress tracking (planned vs actual)
- Assign team members to projects
- Add project documents

### 📋 Bill of Quantities (BOQ)
- Create BOQ documents
- Add items with volume, unit price
- Auto-calculate total price
- Export to Excel format
- Categorize items by type
- Track progress per item

### 🗂️ Master Data
- Master Komponen library (Perangkat/Jasa)
- Material database
- Service database
- Unit pricing management
- Bulk import functionality

### ✅ Task Management
- Create tasks within projects
- Assign to team members
- Track task progress
- Sub-tasks support
- Priority levels
- Task status tracking

### 📈 Progress & Reporting
- S-Curve analysis
- Weekly progress logs
- Project milestone tracking
- Actual vs planned progress

### 👥 RBAC (Role-Based Access Control)
- Admin - Full access
- Project Manager - Manage projects & tasks
- Supervisor - Monitor progress
- Staff - Execute tasks
- Client Viewer - View-only access

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) - React-based SSR
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: JavaScript
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: PostgreSQL

### Database
- **RDBMS**: [PostgreSQL 14+](https://www.postgresql.org/)
- **Schema Management**: Prisma Schema
- **Data Types**: UUID, DECIMAL, JSON, ENUM

### DevOps & Tools
- **Package Manager**: npm
- **Dev Server**: Nodemon (backend), Next.js Dev (frontend)
- **Export**: ExcelJS (Excel generation)

---

## 📁 Struktur Folder

```
PM-BOQ-Enterprise/
├── Backend/                          # Node.js + Express + Prisma
│   ├── server.js                     # Main server file
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables
│   ├── config/
│   │   └── db.js                     # Prisma client
│   ├── models/
│   │   ├── schema.prisma             # Database schema
│   │   └── seed.js                   # Seed script
│   ├── controllers/                  # Business logic
│   │   ├── projectController.js
│   │   ├── boqController.js
│   │   ├── taskController.js
│   │   ├── masterKomponenController.js
│   │   ├── authController.js
│   │   ├── milestoneController.js
│   │   ├── scurveController.js
│   │   └── refController.js
│   ├── routes/                       # API routes
│   │   ├── projectRoutes.js
│   │   ├── boqRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── masterKomponenRoutes.js
│   │   ├── authRoutes.js
│   │   ├── milestoneRoutes.js
│   │   ├── scurveRoutes.js
│   │   └── refRoutes.js
│   ├── utils/
│   │   ├── boqExporter.js            # Excel export utility
│   │   └── fallbackStore.js          # Memory fallback data
│   └── middleware/                   # Express middleware
│
├── Frontend/                         # Next.js + React + TypeScript
│   ├── src/
│   │   ├── app/                      # App router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── boq/
│   │   │   └── settings/
│   │   └── components/               # Reusable components
│   │       ├── sidebar.tsx
│   │       └── ui/
│   ├── package.json                  # Frontend dependencies
│   ├── .env.local                    # Environment variables
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── .github/                          # GitHub workflows (optional)
├── SETUP_GUIDE_ID.md                 # Panduan setup lengkap (BAHASA INDONESIA)
├── DEBUGGING_GUIDE.md                # Troubleshooting guide
├── DATABASE_SCHEMA_ANALYSIS.md       # Schema validation
├── API_DOCUMENTATION.md              # API reference
├── QUICK_START.ps1                   # Automation script
└── README.md                         # File ini
```

---

## 🚀 Panduan Quick Start

### Prerequisites
- ✅ Node.js v18 atau lebih tinggi
- ✅ PostgreSQL 14 atau lebih tinggi
- ✅ npm v9 atau lebih tinggi

### Setup Otomatis (Windows PowerShell)
```powershell
# Jalankan script automation
powershell -ExecutionPolicy Bypass -File QUICK_START.ps1

# Tunggu sampai selesai (akan install dependencies, setup DB, seed data)
```

### Setup Manual (Step by Step)
Lihat detail lengkap di: **[SETUP_GUIDE_ID.md](SETUP_GUIDE_ID.md)**

---

## 📚 Setup Lengkap

### 1️⃣ Database Setup
```powershell
# Start PostgreSQL
Start-Service postgresql-x64-15

# Create database
psql -U postgres
CREATE DATABASE pm_boq;
\q
```

### 2️⃣ Backend Setup
```powershell
cd Backend
npm install
npm run prisma:generate
npm run prisma:db-push
npm run prisma:seed
npm start
```

### 3️⃣ Frontend Setup (Terminal Baru)
```powershell
cd Frontend
npm install
npm run dev
```

### 4️⃣ Akses Aplikasi
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

### 5️⃣ Login
```
Email:    pm@project.com
Password: PM123
```

---

## 🔌 API Endpoints

### Projects
```
GET    /api/projects              - Get all projects
GET    /api/projects/:id          - Get project by ID
POST   /api/projects              - Create project
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete project
```

### Tasks
```
GET    /api/tasks                 - Get all tasks
GET    /api/tasks/:id             - Get task by ID
POST   /api/tasks                 - Create task
PUT    /api/tasks/:id             - Update task
DELETE /api/tasks/:id             - Delete task
```

### BOQ (Bill of Quantities)
```
GET    /api/boq/list/all          - Get all BOQ documents
GET    /api/boq/by-project/:id    - Get BOQ by project
POST   /api/boq/create            - Create BOQ
PUT    /api/boq/update/:id        - Update BOQ
DELETE /api/boq/delete/:id        - Delete BOQ
GET    /api/boq/export/project/:id - Export to Excel
```

### Master Komponen (Master Data)
```
GET    /api/master-komponen       - Get all components
GET    /api/master-komponen/:id   - Get by ID
POST   /api/master-komponen       - Create component
PUT    /api/master-komponen/:id   - Update component
DELETE /api/master-komponen/:id   - Delete component
```

Lihat lengkap di: **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**

---

## 🐛 Troubleshooting

### "Failed to fetch from backend"
```
→ Pastikan backend running di http://localhost:5000
→ Check CORS configuration di Backend/server.js
→ Lihat DEBUGGING_GUIDE.md untuk solusi detail
```

### "Database connection failed"
```
→ PostgreSQL harus running
→ DATABASE_URL di .env harus correct
→ Database pm_boq harus sudah created
```

### "Port already in use"
```
→ Kill process pada port 5000 atau 3000
→ Atau ubah PORT di .env
```

Lihat troubleshooting lengkap: **[DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md)**

---

## 📖 Dokumentasi

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE_ID.md](SETUP_GUIDE_ID.md) | Panduan setup lengkap (Bahasa Indonesia) |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | API reference & endpoint documentation |
| [DATABASE_SCHEMA_ANALYSIS.md](DATABASE_SCHEMA_ANALYSIS.md) | Database schema validation & integrity |
| [DEBUGGING_GUIDE.md](DEBUGGING_GUIDE.md) | Troubleshooting & debugging guide |
| [QUICK_START.ps1](QUICK_START.ps1) | Automated setup script (PowerShell) |

---

## 🧪 Testing

### Test Backend Health
```bash
curl http://localhost:5000/health
# Output: {"status":"ok","message":"Backend server is running"}
```

### Test API Endpoint
```bash
curl http://localhost:5000/api/projects
# Output: [list of projects]
```

### Browser Console (F12)
```
1. Open http://localhost:3000
2. Open DevTools (F12)
3. Go to Console tab
4. Should see no errors
5. Go to Network tab
6. Reload page
7. Should see successful requests to /api/*
```

---

## 🔐 Security Notes

⚠️ **Current State**: Development/Demo mode
- Passwords stored as plain text (NOT secure)
- No JWT tokens implemented
- No request validation
- CORS allows localhost:3000 only

📝 **Before Production**:
- [ ] Implement password hashing (bcrypt)
- [ ] Add JWT authentication
- [ ] Input validation & sanitization
- [ ] API rate limiting
- [ ] HTTPS/TLS
- [ ] Environment-based CORS
- [ ] SQL injection prevention (Prisma helps)
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Audit logging

---

## 🤝 Kontribusi

### Branch Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add tests
chore: Maintenance tasks
```

### Pull Request Process
1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes & commit
3. Push to GitHub
4. Create Pull Request
5. Code review & merge

---

## 📞 Support & Contact

- **Issues**: GitHub Issues
- **Email**: support@pm-boq.example.com
- **Documentation**: See docs folder

---

## 📄 License

This project is proprietary software. All rights reserved.

---

## 👥 Team

- **Project Manager**: Fadilah Riyadi
- **Developers**: [Add names]
- **QA**: [Add names]

---

## 🎉 Acknowledgments

- Inspired by construction industry best practices
- Built with love for team efficiency ❤️

---

## 📊 Project Stats

- **Frontend**: Next.js 14 + TypeScript + Tailwind
- **Backend**: Express.js + Prisma
- **Database**: PostgreSQL
- **API Endpoints**: 40+
- **Database Tables**: 12
- **Components**: 10+
- **Lines of Code**: 5000+

---

**Version**: 1.0.0  
**Last Updated**: May 27, 2026  
**Status**: ✅ Ready for Development

---

## 🚀 Next Steps

1. ✅ Read [SETUP_GUIDE_ID.md](SETUP_GUIDE_ID.md) untuk setup lengkap
2. ✅ Run [QUICK_START.ps1](QUICK_START.ps1) untuk setup otomatis
3. ✅ Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) untuk API reference
4. ✅ Start backend: `cd Backend && npm start`
5. ✅ Start frontend: `cd Frontend && npm run dev`
6. ✅ Login dengan credentials: `pm@project.com` / `PM123`
7. ✅ Explore aplikasi!

---

**Selamat menggunakan PM-BOQ ENTERPRISE!** 🎊

Jika ada pertanyaan atau issue, lihat documentation yang tersedia atau hubungi support team.
