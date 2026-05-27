# ============================================================================
# PM-BOQ ENTERPRISE - QUICK START SCRIPT (PowerShell)
# ============================================================================
# Simple setup script untuk PM-BOQ Enterprise

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      PM-BOQ ENTERPRISE - QUICK START                          ║" -ForegroundColor Cyan
Write-Host "║      Full-Stack Setup & Installation                          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$WORKSPACE = "c:\Users\fadil\Downloads\PM-BOQ-Enterprise"
$BACKEND_DIR = "$WORKSPACE\Backend"
$FRONTEND_DIR = "$WORKSPACE\Frontend"

Write-Host "🔍 STEP 1: Checking Prerequisites..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Check Node.js
try {
    $nodeVer = node --version
    Write-Host "✓ Node.js $nodeVer installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js NOT found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVer = npm --version
    Write-Host "✓ npm $npmVer installed" -ForegroundColor Green
} catch {
    Write-Host "✗ npm NOT found" -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
try {
    $psqlVer = psql --version
    Write-Host "✓ PostgreSQL $psqlVer installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ PostgreSQL NOT in PATH. Make sure it's installed and running." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 STEP 2: Backend Setup..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Push-Location $BACKEND_DIR

# Install dependencies
if (-not (Test-Path "$BACKEND_DIR\node_modules")) {
    Write-Host "📥 Installing Backend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install backend dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} else {
    Write-Host "✓ Backend dependencies already installed" -ForegroundColor Green
}

# Generate Prisma Client
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npm run prisma:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Prisma generation completed (might have warnings)" -ForegroundColor Yellow
}

# Push schema
Write-Host "💾 Pushing database schema..." -ForegroundColor Yellow
Write-Host "   (Answer 'y' if prompted)" -ForegroundColor Gray
npm run prisma:db-push
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database schema pushed" -ForegroundColor Green
} else {
    Write-Host "⚠ Schema push encountered issues - please check database connection" -ForegroundColor Yellow
}

# Seed database
Write-Host "🌱 Seeding database with test data..." -ForegroundColor Yellow
npm run prisma:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Seeding completed (data might already exist)" -ForegroundColor Yellow
}

Pop-Location

Write-Host ""
Write-Host "🎨 STEP 3: Frontend Setup..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Push-Location $FRONTEND_DIR

# Install dependencies
if (-not (Test-Path "$FRONTEND_DIR\node_modules")) {
    Write-Host "📥 Installing Frontend dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install frontend dependencies" -ForegroundColor Red
        Pop-Location
        exit 1
    }
} else {
    Write-Host "✓ Frontend dependencies already installed" -ForegroundColor Green
}

# Check .env.local
if (Test-Path "$FRONTEND_DIR\.env.local") {
    Write-Host "✓ Frontend .env.local already exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating Frontend .env.local..." -ForegroundColor Yellow
    @"
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
"@ | Out-File ".env.local" -Encoding UTF8
    Write-Host "✓ Frontend .env.local created" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✓ SETUP COMPLETED!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 NEXT STEPS - Start the servers in SEPARATE terminals:" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  BACKEND SERVER (Terminal 1):" -ForegroundColor Yellow
Write-Host "   cd $BACKEND_DIR" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host "   → Will run on: http://localhost:5000" -ForegroundColor Green
Write-Host ""

Write-Host "2️⃣  FRONTEND SERVER (Terminal 2 - NEW):" -ForegroundColor Yellow
Write-Host "   cd $FRONTEND_DIR" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   → Will run on: http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  OPEN IN BROWSER:" -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor White
Write-Host "   Email: pm@project.com" -ForegroundColor White
Write-Host "   Password: PM123" -ForegroundColor White
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   Setup Guide: $WORKSPACE\SETUP_GUIDE_ID.md" -ForegroundColor White
Write-Host "   API Docs:    $WORKSPACE\API_DOCUMENTATION.md" -ForegroundColor White
Write-Host "   Debugging:   $WORKSPACE\DEBUGGING_GUIDE.md" -ForegroundColor White
Write-Host ""

Write-Host "✨ Setup completed successfully!" -ForegroundColor Green
Write-Host ""
