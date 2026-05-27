# Database Migration Instructions for Master Data Update

## Recommended Approach: Use Prisma Migrations

Since your project uses **Prisma ORM**, the best approach is to use Prisma's built-in migration system rather than raw SQL. This ensures your migration is tracked and compatible with your schema.

### Step 1: Generate Prisma Migration

```bash
cd Backend
npx prisma migrate dev --name add_merk_to_materials_and_services
```

This will:
- ✅ Detect the schema changes (merk field additions)
- ✅ Create a migration file automatically
- ✅ Apply the migration to your database
- ✅ Regenerate Prisma Client

### Step 2: Verify Migration

The migration file will be created in `Backend/prisma/migrations/` with a timestamp folder.

### Step 3: Restart Services

```bash
# Backend
cd Backend
npm start

# Frontend (in another terminal)
cd Frontend
npm start
```

---

## Alternative: Manual SQL Migration

If you prefer to run SQL manually:

```bash
psql -U postgres -h localhost -p 5000 -d pm_boq
```

Then paste:
```sql
ALTER TABLE "Material" ADD COLUMN "merk" TEXT;
ALTER TABLE "Service" ADD COLUMN "merk" TEXT;
```

---

## Complete Setup Guide

1. **Update Schema** ✅ (Already done in `Backend/models/schema.prisma`)
2. **Run Migration**
   ```bash
   cd Backend
   npx prisma migrate dev --name add_merk_to_materials_and_services
   ```
3. **Regenerate Client** (automatic with above command)
4. **Restart Backend**
   ```bash
   npm start
   ```
5. **Restart Frontend** (auto-reload in dev mode)
6. **Test** at `http://localhost:3002/settings/master-data`

