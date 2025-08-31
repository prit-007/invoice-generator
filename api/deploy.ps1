# Vercel Deployment Script for FastAPI Invoice Management API

Write-Host "🚀 Deploying Invoice Management API to Vercel..." -ForegroundColor Green

# Check if vercel CLI is installed
try {
    vercel --version | Out-Null
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Set environment variables (you'll need to configure these in Vercel dashboard)
Write-Host "📝 Environment variables needed:" -ForegroundColor Yellow
Write-Host "   - user (PostgreSQL username)" -ForegroundColor White
Write-Host "   - password (PostgreSQL password)" -ForegroundColor White
Write-Host "   - host (PostgreSQL host)" -ForegroundColor White
Write-Host "   - port (PostgreSQL port)" -ForegroundColor White
Write-Host "   - dbname (PostgreSQL database name)" -ForegroundColor White

# Deploy to Vercel
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🔗 Your API is now live on Vercel" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "2. Update your frontend API_BASE_URL to point to the new Vercel URL" -ForegroundColor White
Write-Host "3. Test all endpoints to ensure they work correctly" -ForegroundColor White
