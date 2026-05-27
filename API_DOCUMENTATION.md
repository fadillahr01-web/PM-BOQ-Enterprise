# 🚀 PM-BOQ ENTERPRISE - API DOCUMENTATION

## Base URL
```
Development: http://localhost:5000
Production: https://api.pm-boq.example.com (configure as needed)
```

---

## 📌 AUTHENTICATION

### Login
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "pm@project.com",
    "password": "PM123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "id": "uuid",
    "name": "Fadilah Riyadi",
    "email": "pm@project.com",
    "role": "PROJECT_MANAGER"
  }
  ```
- **Default Test Users**:
  | Email | Password | Role |
  |-------|----------|------|
  | admin@project.com | Admin123 | ADMIN |
  | pm@project.com | PM123 | PROJECT_MANAGER |
  | siti@pmboq.com | Supervisor123 | SUPERVISOR |
  | client@client.com | Client123 | CLIENT_VIEWER |

---

## 📊 PROJECTS API

### Get All Projects
- **Endpoint**: `GET /api/projects`
- **Response (200)**:
  ```json
  [
    {
      "id": "uuid",
      "name": "Pembangunan Office Interior",
      "clientName": "Toko Pedpedia",
      "location": "Jakarta Selatan",
      "budget": 1500000000.00,
      "actualCost": 920000000.00,
      "status": "IN_PROGRESS",
      "actualProgress": 58.5,
      "startDate": "2026-03-01T00:00:00Z",
      "endDate": "2026-08-15T00:00:00Z",
      "members": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "name": "Fadilah Riyadi",
            "email": "pm@project.com",
            "role": "PROJECT_MANAGER"
          }
        }
      ]
    }
  ]
  ```

### Get Project by ID
- **Endpoint**: `GET /api/projects/:id`
- **Parameters**: 
  - `id` (uuid) - Project ID
- **Response (200)**:
  ```json
  {
    "id": "uuid",
    "name": "Pembangunan Office Interior",
    "description": "Pekerjaan interior kantor modern...",
    "clientName": "Toko Pedpedia",
    "location": "Jakarta Selatan",
    "budget": 1500000000.00,
    "actualCost": 920000000.00,
    "startDate": "2026-03-01T00:00:00Z",
    "endDate": "2026-08-15T00:00:00Z",
    "plannedProgress": 65.0,
    "actualProgress": 58.5,
    "status": "IN_PROGRESS",
    "tasks": [
      {
        "id": "uuid",
        "name": "Pemasangan Dinding Partisi",
        "status": "ON_PROGRESS",
        "priority": "HIGH",
        "progress": 40.0,
        "assignee": {
          "id": "uuid",
          "name": "Fadilah Riyadi"
        }
      }
    ],
    "members": [],
    "documents": []
  }
  ```

### Create Project
- **Endpoint**: `POST /api/projects`
- **Body**:
  ```json
  {
    "name": "Proyek Baru",
    "description": "Deskripsi proyek",
    "clientName": "Klien A",
    "location": "Jakarta",
    "budget": 500000000.00,
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z",
    "status": "NOT_STARTED"
  }
  ```
- **Response (201)**: Created project object

### Update Project
- **Endpoint**: `PUT /api/projects/:id`
- **Body**: Same as Create (fields to update)
- **Response (200)**: Updated project object

### Delete Project
- **Endpoint**: `DELETE /api/projects/:id`
- **Response (200)**: `{"message": "Project deleted"}`

---

## 📋 TASKS API

### Get All Tasks
- **Endpoint**: `GET /api/tasks`
- **Query Parameters** (optional):
  - `projectId=uuid` - Filter by project
  - `status=ON_PROGRESS` - Filter by status
- **Response (200)**: Array of tasks

### Get Task by ID
- **Endpoint**: `GET /api/tasks/:id`
- **Response (200)**:
  ```json
  {
    "id": "uuid",
    "projectId": "uuid",
    "name": "Pemasangan Dinding Partisi GRC",
    "description": "...",
    "startDate": "2026-05-01T00:00:00Z",
    "endDate": "2026-05-25T00:00:00Z",
    "status": "ON_PROGRESS",
    "priority": "HIGH",
    "progress": 40.0,
    "assignee": {
      "id": "uuid",
      "name": "Fadilah Riyadi"
    },
    "subTasks": [
      {
        "id": "uuid",
        "name": "Pengukuran & marking area",
        "isCompleted": true
      }
    ]
  }
  ```

### Create Task
- **Endpoint**: `POST /api/tasks`
- **Body**:
  ```json
  {
    "projectId": "uuid",
    "name": "Task Name",
    "description": "Task description",
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-06-15T00:00:00Z",
    "status": "NOT_STARTED",
    "priority": "MEDIUM",
    "assigneeId": "uuid"
  }
  ```
- **Response (201)**: Created task object

### Update Task
- **Endpoint**: `PUT /api/tasks/:id`
- **Body**: Fields to update
- **Response (200)**: Updated task object

### Delete Task
- **Endpoint**: `DELETE /api/tasks/:id`
- **Response (200)**: `{"message": "Task deleted"}`

---

## 📦 BOQ API (Bill of Quantities)

### Get All BOQs
- **Endpoint**: `GET /api/boq/list/all`
- **Response (200)**: Array of BOQ documents

### Get BOQs by Project
- **Endpoint**: `GET /api/boq/by-project/:projectId`
- **Response (200)**:
  ```json
  [
    {
      "id": "uuid",
      "projectId": "uuid",
      "namaBoq": "BOQ Pekerjaan Interior",
      "keterangan": "...",
      "tanggalBuat": "2026-05-27T00:00:00Z",
      "status": "DRAFT",
      "totalHarga": 500000000.00,
      "items": [
        {
          "id": "uuid",
          "masterKomponenId": "uuid",
          "volume": 100.0,
          "hargaSatuan": 50000.00,
          "totalHarga": 5000000.00,
          "keterangan": "..."
        }
      ]
    }
  ]
  ```

### Get BOQ Details
- **Endpoint**: `GET /api/boq/details/:id`
- **Response (200)**: Complete BOQ object with all items

### Create BOQ
- **Endpoint**: `POST /api/boq/create`
- **Body**:
  ```json
  {
    "projectId": "uuid",
    "namaBoq": "BOQ Pekerjaan Interior",
    "keterangan": "Detail pekerjaan",
    "status": "DRAFT",
    "items": [
      {
        "masterKomponenId": "uuid",
        "volume": 100.0,
        "hargaSatuan": 50000.00,
        "totalHarga": 5000000.00,
        "keterangan": "..."
      }
    ]
  }
  ```
- **Response (201)**: Created BOQ

### Update BOQ
- **Endpoint**: `PUT /api/boq/update/:id`
- **Body**: Fields to update
- **Response (200)**: Updated BOQ

### Delete BOQ
- **Endpoint**: `DELETE /api/boq/delete/:id`
- **Response (200)**: `{"message": "BOQ deleted"}`

### Export BOQ to Excel
- **Endpoint**: `GET /api/boq/export/project/:projectId`
- **Response (200)**: Excel file (content-type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

## 🗂️ MASTER KOMPONEN API (Master Data)

### Get All Master Komponen
- **Endpoint**: `GET /api/master-komponen`
- **Query Parameters** (optional):
  - `tipe=PERANGKAT` - Filter by type (PERANGKAT or JASA)
- **Response (200)**:
  ```json
  [
    {
      "id": "uuid",
      "kode": "MK001",
      "namaKomponen": "Drywall GRC 12mm",
      "satuan": "lembar",
      "hargaSatuan": 150000.00,
      "tipe": "PERANGKAT",
      "createdAt": "2026-05-27T00:00:00Z",
      "updatedAt": "2026-05-27T00:00:00Z"
    }
  ]
  ```

### Get Master Komponen by ID
- **Endpoint**: `GET /api/master-komponen/:id`
- **Response (200)**: Single komponen object

### Get Master Komponen by Kode
- **Endpoint**: `GET /api/master-komponen/kode/:kode`
- **Parameters**: 
  - `kode` (string) - Unique component code
- **Response (200)**: Single komponen object

### Create Master Komponen
- **Endpoint**: `POST /api/master-komponen`
- **Body**:
  ```json
  {
    "kode": "MK001",
    "namaKomponen": "Drywall GRC 12mm",
    "satuan": "lembar",
    "hargaSatuan": 150000.00,
    "tipe": "PERANGKAT"
  }
  ```
- **Response (201)**: Created komponen

### Bulk Create Master Komponen
- **Endpoint**: `POST /api/master-komponen/bulk/create`
- **Body**:
  ```json
  [
    {
      "kode": "MK001",
      "namaKomponen": "Component 1",
      "satuan": "unit",
      "hargaSatuan": 100000.00,
      "tipe": "PERANGKAT"
    },
    {
      "kode": "MK002",
      "namaKomponen": "Component 2",
      "satuan": "jam",
      "hargaSatuan": 200000.00,
      "tipe": "JASA"
    }
  ]
  ```
- **Response (201)**: Array of created components

### Update Master Komponen
- **Endpoint**: `PUT /api/master-komponen/:id`
- **Body**: Fields to update
- **Response (200)**: Updated komponen

### Delete Master Komponen
- **Endpoint**: `DELETE /api/master-komponen/:id`
- **Response (200)**: `{"message": "Master komponen deleted"}`

---

## 🎯 MILESTONES API

### Get All Milestones
- **Endpoint**: `GET /api/milestones`
- **Query Parameters** (optional):
  - `projectId=uuid` - Filter by project
- **Response (200)**:
  ```json
  [
    {
      "id": "uuid",
      "projectId": "uuid",
      "stage": 1,
      "name": "Design & Planning",
      "status": "DONE",
      "picId": "uuid",
      "pic": {
        "id": "uuid",
        "name": "Fadilah Riyadi"
      },
      "metadata": {}
    }
  ]
  ```

### Create Milestone
- **Endpoint**: `POST /api/milestones`
- **Body**:
  ```json
  {
    "projectId": "uuid",
    "stage": 1,
    "name": "Phase 1 - Design",
    "status": "NOT_STARTED",
    "picId": "uuid"
  }
  ```
- **Response (201)**: Created milestone

---

## 📈 S-CURVE API (Progress Tracking)

### Get S-Curve Data
- **Endpoint**: `GET /api/s-curve/:projectId`
- **Response (200)**:
  ```json
  {
    "projectId": "uuid",
    "plannedCurve": [
      {"week": 1, "progress": 2.0},
      {"week": 2, "progress": 5.0}
    ],
    "actualCurve": [
      {"week": 1, "progress": 1.5},
      {"week": 2, "progress": 4.2}
    ]
  }
  ```

---

## ✅ HEALTH CHECK & INFO

### Health Check
- **Endpoint**: `GET /health`
- **Response (200)**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-05-27T...",
    "message": "Backend server is running"
  }
  ```

### API Info
- **Endpoint**: `GET /api/info`
- **Response (200)**:
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

## 🔄 COMMON REQUEST/RESPONSE PATTERNS

### Request Headers
```
Content-Type: application/json
Accept: application/json
(Optional) Authorization: Bearer <token>  (if JWT implemented)
```

### Success Response (200, 201)
```json
{
  "id": "uuid",
  "data": {...}
}
```

### Error Response (400, 404, 500)
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

### Pagination (if implemented)
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## 📝 DATA TYPES

### Enums
```
Role: ADMIN | PROJECT_MANAGER | SUPERVISOR | STAFF | CLIENT_VIEWER
TaskStatus: NOT_STARTED | ON_PROGRESS | DONE | PENDING
ProjectStatus: NOT_STARTED | IN_PROGRESS | DONE | PENDING | CANCEL
Priority: LOW | MEDIUM | HIGH | CRITICAL
MilestoneStatus: NOT_STARTED | ON_PROGRESS | DONE | PENDING | CANCEL
BOQType: PERANGKAT | JASA
```

### Common Fields
- **id**: UUID string (unique identifier)
- **createdAt**: ISO 8601 timestamp
- **updatedAt**: ISO 8601 timestamp
- **progress**: Float (0.0 - 100.0)
- **budget/price**: Decimal(15,2) for currency

---

## 🧪 TESTING WITH CURL

### Get All Projects
```bash
curl http://localhost:5000/api/projects
```

### Get Project by ID
```bash
curl http://localhost:5000/api/projects/uuid
```

### Create Project
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Project",
    "clientName": "Client Name",
    "location": "Jakarta",
    "budget": 500000000,
    "startDate": "2026-06-01T00:00:00Z",
    "endDate": "2026-12-31T00:00:00Z"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pm@project.com",
    "password": "PM123"
  }'
```

---

## 📞 ERROR CODES

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request body/parameters |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend error - check logs |
| 503 | Service Unavailable | Database connection failed |

---

## 🚀 NEXT FEATURES (To Implement)

- [ ] JWT Authentication tokens
- [ ] API rate limiting
- [ ] Input validation & sanitization
- [ ] API documentation with Swagger
- [ ] WebSocket for real-time updates
- [ ] File upload for documents
- [ ] Pagination for large datasets
- [ ] Search & filtering capabilities
- [ ] Audit logs for changes
- [ ] GraphQL alternative

---

Last Updated: May 27, 2026
