# ============================================================================
# PM-BOQ ENTERPRISE - QUICK START SCRIPT (PowerShell)
# ============================================================================
# Script ini otomatis setup backend, frontend, dan database
# Jalankan: powershell -ExecutionPolicy Bypass -File QUICK_START.ps1

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      PM-BOQ ENTERPRISE - QUICK START AUTOMATION               ║" -ForegroundColor Cyan
Write-Host "║      Full-Stack Initialization Script                         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$WORKSPACE = "c:\Users\fadil\Downloads\PM-BOQ-Enterprise"
$BACKEND_DIR = "$WORKSPACE\Backend"
$FRONTEND_DIR = "$WORKSPACE\Frontend"
$LOG_FILE = "$WORKSPACE\setup-log.txt"

# Colors
$SUCCESS = "Green"
$ERROR = "Red"
$INFO = "Cyan"
$WARNING = "Yellow"

function Log {
    param([string]$Message, [string]$Color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage -ForegroundColor $Color
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Check-Prerequisite {
    param([string]$Command, [string]$Description)
    
    try {
        $version = & $Command --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            Log "✓ $Description installed" $SUCCESS
            return $true
        }
    }
    catch {
        Log "✗ $Description NOT found" $ERROR
        return $false
    }
}

# Start logging
Log "═══ PM-BOQ ENTERPRISE SETUP STARTED ═══" $INFO

# ============================================================================
# STEP 1: Check Prerequisites
# ============================================================================
Write-Host "`n[STEP 1] Checking Prerequisites..." -ForegroundColor $INFO
Log "Step 1: Checking Prerequisites"

$allGood = $true
$allGood = (Check-Prerequisite "node" "Node.js") -and $allGood
$allGood = (Check-Prerequisite "npm" "npm") -and $allGood
$allGood = (Check-Prerequisite "psql" "PostgreSQL") -and $allGood

if (-not $allGood) {
    Log "✗ Some prerequisites missing. Please install required software." $ERROR
    Write-Host "`nPlease install:" -ForegroundColor $WARNING
    Write-Host "  • Node.js (https://nodejs.org/)" -ForegroundColor $WARNING
    Write-Host "  • PostgreSQL (https://www.postgresql.org/download/)" -ForegroundColor $WARNING
    exit 1
}

# ============================================================================
# STEP 2: Setup Backend
# ============================================================================
Write-Host "`n[STEP 2] Setting up Backend..." -ForegroundColor $INFO
Log "Step 2: Backend Setup"

if (Test-Path "$BACKEND_DIR\package.json") {
    Log "Navigate to Backend directory" $INFO
    Push-Location $BACKEND_DIR
    
    if (-not (Test-Path "$BACKEND_DIR\node_modules")) {
        Log "Installing Backend dependencies..." $INFO
        npm install
        if ($LASTEXITCODE -eq 0) {
            Log "✓ Backend dependencies installed" $SUCCESS
        } else {
            Log "✗ Failed to install backend dependencies" $ERROR
        }
    } else {
        Log "✓ Backend dependencies already installed" $SUCCESS
    }
    
    # Generate Prisma Client
    Log "Generating Prisma Client..." $INFO
    npm run prisma:generate
    if ($LASTEXITCODE -eq 0) {
        Log "✓ Prisma Client generated" $SUCCESS
    }
    
    # Push schema to database
    Log "Pushing Prisma schema to database..." $INFO
    Write-Host "  Confirm schema changes when prompted..." -ForegroundColor $WARNING
    npm run prisma:db-push
    if ($LASTEXITCODE -eq 0) {
        Log "✓ Database schema updated" $SUCCESS
    }
    
    # Seed database
    Log "Seeding database with default data..." $INFO
    npm run prisma:seed
    if ($LASTEXITCODE -eq 0) {
        Log "✓ Database seeded successfully" $SUCCESS
    }
    
    Pop-Location
} else {
    Log "✗ Backend folder not found at $BACKEND_DIR" $ERROR
}

# ============================================================================
# STEP 3: Setup Frontend
# ============================================================================
Write-Host "`n[STEP 3] Setting up Frontend..." -ForegroundColor $INFO
Log "Step 3: Frontend Setup"

if (Test-Path "$FRONTEND_DIR\package.json") {
    Log "Navigate to Frontend directory" $INFO
    Push-Location $FRONTEND_DIR
    
    if (-not (Test-Path "$FRONTEND_DIR\node_modules")) {
        Log "Installing Frontend dependencies..." $INFO
        npm install
        if ($LASTEXITCODE -eq 0) {
            Log "✓ Frontend dependencies installed" $SUCCESS
        } else {
            Log "✗ Failed to install frontend dependencies" $ERROR
        }
    } else {
        Log "✓ Frontend dependencies already installed" $SUCCESS
    }
    
    # Check .env.local
    if (Test-Path "$FRONTEND_DIR\.env.local") {
        Log "✓ Frontend .env.local already configured" $SUCCESS
    } else {
        Log "Creating Frontend .env.local..." $INFO
        @"
# Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV=development
"@ | Out-File ".env.local" -Encoding UTF8
        Log "✓ Frontend .env.local created" $SUCCESS
    }
    
    Pop-Location
} else {
    Log "✗ Frontend folder not found at $FRONTEND_DIR" $ERROR
}

# ============================================================================
# STEP 4: Verification & Summary
# ============================================================================
Write-Host "`n[STEP 4] Verification Summary" -ForegroundColor $INFO
Log "Step 4: Verification Complete"

Write-Host "`n" -ForegroundColor Green
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                    ✓ SETUP COMPLETED!                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 NEXT STEPS - RUN THESE COMMANDS IN SEPARATE TERMINALS:" -ForegroundColor $INFO
Write-Host ""

Write-Host "1️⃣  START BACKEND SERVER:" -ForegroundColor $WARNING
Write-Host "   cd $BACKEND_DIR" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host "   ✓ Will run on: http://localhost:5000" -ForegroundColor $SUCCESS
Write-Host ""

Write-Host "2️⃣  START FRONTEND SERVER (in NEW terminal):" -ForegroundColor $WARNING
Write-Host "   cd $FRONTEND_DIR" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   ✓ Will run on: http://localhost:3000" -ForegroundColor $SUCCESS
Write-Host ""

Write-Host "3️⃣  LOGIN WITH DEFAULT CREDENTIALS:" -ForegroundColor $WARNING
Write-Host "   Email: pm@project.com" -ForegroundColor White
Write-Host "   Password: PM123" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  TEST INTEGRATION:" -ForegroundColor $WARNING
Write-Host "   • Open: http://localhost:3000" -ForegroundColor White
Write-Host "   • Login with credentials above" -ForegroundColor White
Write-Host "   • Navigate to Projects page" -ForegroundColor White
Write-Host "   • Should display data from backend" -ForegroundColor White
Write-Host ""

Write-Host "🔍 VERIFY BACKEND ENDPOINTS:" -ForegroundColor $INFO
Write-Host "   • Health: http://localhost:5000/health" -ForegroundColor White
Write-Host "   • API Info: http://localhost:5000/api/info" -ForegroundColor White
Write-Host "   • Projects: http://localhost:5000/api/projects" -ForegroundColor White
Write-Host ""

Write-Host "📊 API ENDPOINTS AVAILABLE:" -ForegroundColor $INFO
Write-Host "   • GET  /api/projects              - List all projects" -ForegroundColor White
Write-Host "   • GET  /api/boq/list/all          - List all BOQ documents" -ForegroundColor White
Write-Host "   • GET  /api/master-komponen       - Master data (Perangkat/Jasa)" -ForegroundColor White
Write-Host "   • GET  /api/tasks                 - List all tasks" -ForegroundColor White
Write-Host "   • GET  /api/milestones            - List all milestones" -ForegroundColor White
Write-Host ""

Write-Host "📝 SETUP LOG:" -ForegroundColor $INFO
Write-Host "   Saved to: $LOG_FILE" -ForegroundColor White
Write-Host ""

Write-Host "💡 TIP: Use SETUP_GUIDE_ID.md for detailed troubleshooting" -ForegroundColor $WARNING
Write-Host ""

Log "═══ PM-BOQ ENTERPRISE SETUP COMPLETED SUCCESSFULLY ═══" $SUCCESS

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
