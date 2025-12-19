# Milkman API Deployment Script for Windows/PowerShell
# Usage: .\deploy.ps1

Write-Host "🚀 Starting Milkman API Deployment..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file from env.example" -ForegroundColor Yellow
    exit 1
}

# Check Node.js version
$nodeVersion = node --version
Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install --production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Create uploads directory
Write-Host ""
Write-Host "📁 Creating uploads directory..." -ForegroundColor Cyan
if (-not (Test-Path "uploads")) {
    New-Item -ItemType Directory -Path "uploads" | Out-Null
}
Write-Host "✓ Uploads directory ready" -ForegroundColor Green

# Run migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
npm run migrate

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Migration failed. Please check your database configuration." -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
} else {
    Write-Host "✓ Migrations completed" -ForegroundColor Green
}

# Check if PM2 is installed
$pm2Installed = Get-Command pm2 -ErrorAction SilentlyContinue
if ($pm2Installed) {
    Write-Host ""
    Write-Host "🔄 Restarting application with PM2..." -ForegroundColor Cyan
    
    # Stop existing process if running
    pm2 stop milkman-api 2>$null
    pm2 delete milkman-api 2>$null
    
    # Start application
    pm2 start src/server.ts --name milkman-api --interpreter ts-node
    pm2 save
    
    Write-Host "✓ Application started with PM2" -ForegroundColor Green
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Cyan
    Write-Host "  pm2 logs milkman-api    # View logs"
    Write-Host "  pm2 status              # Check status"
    Write-Host "  pm2 restart milkman-api # Restart"
} else {
    Write-Host ""
    Write-Host "⚠️  PM2 not found. Install it with: npm install -g pm2" -ForegroundColor Yellow
    Write-Host "Or start manually with: npm start" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Test your API:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:4000/api/health"
