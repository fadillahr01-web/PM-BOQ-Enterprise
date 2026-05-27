# 📚 API Reference - PM-BOQ Enterprise Backend

## Base URL
```
http://localhost:5000
```

---

## 🏥 Health Check

### Check Server Status
```http
GET /health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-05-25T10:30:45.123Z",
  "message": "Backend server is running"
}
```

---

### Get API Info
```http
GET /api/info
```

**Response (200):**
```json
{
  "name": "PM-BOQ Enterprise Backend",
  "version": "1.0.0",
  "endpoints": {
    "projects": "/api/projects",
    "tasks": "/api/tasks",
    "boq": "/api/boq",
    "masterKomponen": "/api/master-komponen",
    "auth": "/api/auth",
    "milestones": "/api/milestones",
    "sCurve": "/api/s-curve"
  }
}
```

---

## 📁 Projects

### Get All Projects
```http
GET /api/projects
```

**Response (200):**
```json
[
  {
    "id": "uuid-123",
    "name": "Renovasi Gedung A",
    "clientName": "PT Maju Jaya",
    "location": "Jakarta Pusat",
    "budget": "2000000000.00",
    "actualCost": "1200000000.00",
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z",
    "status": "IN_PROGRESS",
    "plannedProgress": 65.0,
    "actualProgress": 58.5,
    "createdAt": "2026-05-20T10:00:00Z",
    "members": []
  }
]
```

---

### Get Project by ID
```http
GET /api/projects/:id
```

**URL Parameters:**
- `id` (required): Project UUID

**Response (200):**
```json
{
  "id": "uuid-123",
  "name": "Renovasi Gedung A",
  "clientName": "PT Maju Jaya",
  "location": "Jakarta Pusat",
  "budget": "2000000000.00",
  "actualCost": "1200000000.00",
  "startDate": "2026-06-01T00:00:00Z",
  "endDate": "2026-12-31T00:00:00Z",
  "status": "IN_PROGRESS",
  "plannedProgress": 65.0,
  "actualProgress": 58.5,
  "createdAt": "2026-05-20T10:00:00Z",
  "tasks": [],
  "members": [],
  "milestones": [],
  "boqs": []
}
```

---

### Create Project
```http
POST /api/projects
```

**Request Body:**
```json
{
  "name": "Renovasi Gedung A",
  "description": "Renovasi lengkap gedung A",
  "clientName": "PT Maju Jaya",
  "location": "Jakarta Pusat",
  "budget": 2000000000,
  "startDate": "2026-06-01",
  "endDate": "2026-12-31",
  "status": "IN_PROGRESS"
}
```

**Required Fields:**
- `name` (string)
- `clientName` (string)
- `location` (string)
- `budget` (number)
- `startDate` (ISO date string)
- `endDate` (ISO date string)

**Response (201):**
```json
{
  "message": "Project created successfully",
  "data": {
    "id": "uuid-456",
    "name": "Renovasi Gedung A",
    ...
  }
}
```

---

### Update Project
```http
PUT /api/projects/:id
```

**URL Parameters:**
- `id` (required): Project UUID

**Request Body (all optional):**
```json
{
  "name": "Renovasi Gedung A (Updated)",
  "clientName": "PT Maju Jaya",
  "budget": 2500000000,
  "actualCost": 1300000000,
  "status": "DONE",
  "plannedProgress": 100,
  "actualProgress": 95
}
```

**Response (200):**
```json
{
  "message": "Project updated successfully",
  "data": { ... }
}
```

---

### Delete Project
```http
DELETE /api/projects/:id
```

**Response (200):**
```json
{
  "message": "Project deleted successfully"
}
```

---

## 📦 Master Komponen (BOQ Library)

### Get All Master Komponen
```http
GET /api/master-komponen
```

**Response (200):**
```json
[
  {
    "id": "uuid-1",
    "kode": "PG-001",
    "namaKomponen": "Dinding Partisi Gypsum Double-Side",
    "satuan": "m2",
    "hargaSatuan": "185000.00",
    "tipe": "PERANGKAT",
    "createdAt": "2026-05-25T10:00:00Z"
  }
]
```

---

### Get Master Komponen by ID
```http
GET /api/master-komponen/:id
```

**Response (200):**
```json
{
  "id": "uuid-1",
  "kode": "PG-001",
  "namaKomponen": "Dinding Partisi Gypsum Double-Side",
  "satuan": "m2",
  "hargaSatuan": "185000.00",
  "tipe": "PERANGKAT"
}
```

---

### Get Master Komponen by Kode
```http
GET /api/master-komponen/kode/:kode
```

**URL Parameters:**
- `kode` (required): Kode Komponen (e.g., "PG-001")

---

### Create Master Komponen
```http
POST /api/master-komponen
```

**Request Body:**
```json
{
  "kode": "PG-005",
  "namaKomponen": "Dinding Bata Merah",
  "satuan": "m2",
  "hargaSatuan": 155000,
  "tipe": "PERANGKAT"
}
```

**Required Fields:**
- `kode` (string, unique)
- `namaKomponen` (string)
- `satuan` (string)
- `hargaSatuan` (number)
- `tipe` (optional, default: "PERANGKAT" | options: "PERANGKAT", "JASA")

**Response (201):**
```json
{
  "message": "Master komponen created successfully",
  "data": { ... }
}
```

---

### Bulk Create Master Komponen
```http
POST /api/master-komponen/bulk/create
```

**Request Body:**
```json
{
  "items": [
    {
      "kode": "PG-010",
      "namaKomponen": "Partisi Kaca",
      "satuan": "m2",
      "hargaSatuan": 450000,
      "tipe": "PERANGKAT"
    },
    {
      "kode": "FN-005",
      "namaKomponen": "Finishing Kayu",
      "satuan": "m2",
      "hargaSatuan": 245000,
      "tipe": "JASA"
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "2 master komponen created",
  "created": [...],
  "failed": [],
  "summary": {
    "total": 2,
    "success": 2,
    "failed": 0
  }
}
```

---

### Update Master Komponen
```http
PUT /api/master-komponen/:id
```

**Request Body (all optional):**
```json
{
  "kode": "PG-005-UPDATED",
  "namaKomponen": "Dinding Bata Merah Updated",
  "hargaSatuan": 165000
}
```

---

### Delete Master Komponen
```http
DELETE /api/master-komponen/:id
```

**Response (200):**
```json
{
  "message": "Master komponen deleted successfully"
}
```

---

## 📊 BOQ (Bill of Quantities)

### Get All BOQs
```http
GET /api/boq/list/all
```

**Response (200):**
```json
[
  {
    "id": "uuid-boq-1",
    "projectId": "uuid-project-1",
    "namaBoq": "BOQ Phase 1 - Struktur",
    "keterangan": "BOQ untuk pekerjaan struktur",
    "status": "FINALIZED",
    "totalHarga": "125000000.00",
    "tanggalBuat": "2026-05-25T10:00:00Z",
    "items": [...],
    "project": {
      "id": "uuid-project-1",
      "name": "Renovasi Gedung A"
    }
  }
]
```

---

### Get BOQ by ID
```http
GET /api/boq/details/:id
```

**Response (200):**
```json
{
  "id": "uuid-boq-1",
  "projectId": "uuid-project-1",
  "namaBoq": "BOQ Phase 1",
  "items": [
    {
      "id": "uuid-item-1",
      "boqId": "uuid-boq-1",
      "masterKomponenId": "uuid-komponen-1",
      "volume": 150.0,
      "hargaSatuan": "185000.00",
      "totalHarga": "27750000.00",
      "keterangan": "Partisi gypsum"
    }
  ]
}
```

---

### Get BOQs by Project ID
```http
GET /api/boq/by-project/:projectId
```

**URL Parameters:**
- `projectId` (required): Project UUID

**Response (200):**
Array of BOQs for the specified project

---

### Create BOQ
```http
POST /api/boq/create
```

**Request Body:**
```json
{
  "projectId": "uuid-project-1",
  "namaBoq": "BOQ Phase 1 - Struktur",
  "keterangan": "BOQ untuk pekerjaan struktur beton",
  "items": [
    {
      "masterKomponenId": "uuid-komponen-1",
      "volume": 150,
      "hargaSatuan": 185000,
      "keterangan": "Partisi gypsum ruang kantor"
    },
    {
      "masterKomponenId": "uuid-komponen-2",
      "volume": 200,
      "hargaSatuan": 95000,
      "keterangan": "Plafond gypsum"
    }
  ]
}
```

**Required Fields:**
- `projectId` (string)
- `namaBoq` (string)
- `items` (array, non-empty)
  - `masterKomponenId` (string)
  - `volume` (number)
  - `hargaSatuan` (number)

**Response (201):**
```json
{
  "message": "BOQ created successfully",
  "data": { ... }
}
```

---

### Update BOQ
```http
PUT /api/boq/update/:id
```

**Request Body (all optional):**
```json
{
  "namaBoq": "BOQ Phase 1 Updated",
  "status": "FINALIZED",
  "keterangan": "Updated description",
  "items": [
    {
      "masterKomponenId": "uuid-komponen-1",
      "volume": 160,
      "hargaSatuan": 185000
    }
  ]
}
```

---

### Delete BOQ
```http
DELETE /api/boq/delete/:id
```

**Response (200):**
```json
{
  "message": "BOQ deleted successfully"
}
```

---

### Export BOQ to Excel
```http
GET /api/boq/export/project/:projectId
```

**URL Parameters:**
- `projectId` (required): Project UUID

**Response:**
- File download: `BOQ_ProjectName_Timestamp.xlsx`
- Format: Professional Excel dengan tabel terformat
- Kolom: No, Komponen, Satuan, Volume, Harga Satuan, Total Harga
- Baris Total di bagian bawah

---

## 📊 Tasks

### Get All Tasks
```http
GET /api/tasks
```

### Get Task by ID
```http
GET /api/tasks/:id
```

### Create Task
```http
POST /api/tasks
```

**Request Body:**
```json
{
  "projectId": "uuid-project-1",
  "name": "Pemasangan Partisi",
  "description": "Pemasangan partisi gypsum",
  "startDate": "2026-06-01",
  "endDate": "2026-06-15",
  "priority": "HIGH",
  "assigneeId": "uuid-user-1"
}
```

### Update Task
```http
PUT /api/tasks/:id
```

### Delete Task
```http
DELETE /api/tasks/:id
```

---

## 📅 Milestones

### Get All Milestones
```http
GET /api/milestones
```

### Create Milestone
```http
POST /api/milestones
```

**Request Body:**
```json
{
  "projectId": "uuid-project-1",
  "stage": 1,
  "name": "Tahap Inisiasi",
  "status": "DONE",
  "picId": "uuid-user-1",
  "metadata": {
    "surveyDate": "2026-05-20",
    "notes": "Survey completed"
  }
}
```

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields: name, clientName, location"
}
```

### 404 Not Found
```json
{
  "error": "Project not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!",
  "details": "Error message here (development only)"
}
```

---

## 🔐 Authentication

Currently, the API does not enforce authentication. For production:
- Add JWT token validation middleware
- Protect all endpoints
- Implement role-based access control (RBAC)

---

## 📝 Data Types & Formats

| Type | Format | Example |
|------|--------|---------|
| Date | ISO 8601 | "2026-06-01T00:00:00Z" |
| Currency | Decimal String | "1500000000.00" |
| UUID | UUID v4 | "f47ac10b-58cc-4372-a567-0e02b2c3d479" |
| Enum | String | "IN_PROGRESS", "DRAFT" |

---

## 📋 Status Values

### Project Status
- `NOT_STARTED`
- `IN_PROGRESS`
- `DONE`
- `PENDING`
- `CANCEL`

### BOQ Status
- `DRAFT`
- `FINALIZED`

### Task Status
- `NOT_STARTED`
- `ON_PROGRESS`
- `DONE`
- `PENDING`

### Milestone Status
- `NOT_STARTED`
- `ON_PROGRESS`
- `DONE`
- `PENDING`
- `CANCEL`

---

## 🧪 Testing with cURL

**Get All Projects:**
```bash
curl http://localhost:5000/api/projects
```

**Create Project:**
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "clientName": "Test Client",
    "location": "Jakarta",
    "budget": 1000000000,
    "startDate": "2026-06-01",
    "endDate": "2026-12-31"
  }'
```

**Export BOQ:**
```bash
curl -X GET http://localhost:5000/api/boq/export/project/PROJECT-UUID \
  --output BOQ_Export.xlsx
```

---

**Last Updated: May 25, 2026**
