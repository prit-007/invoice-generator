#!/bin/bash

# Vercel Deployment Script for FastAPI Invoice Management API

echo "🚀 Deploying Invoice Management API to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Set environment variables (you'll need to configure these in Vercel dashboard)
echo "📝 Environment variables needed:"
echo "   - user (PostgreSQL username)"
echo "   - password (PostgreSQL password)" 
echo "   - host (PostgreSQL host)"
echo "   - port (PostgreSQL port)"
echo "   - dbname (PostgreSQL database name)"

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your API is now live on Vercel"
echo ""
echo "📋 Next steps:"
echo "1. Configure environment variables in Vercel dashboard"
echo "2. Update your frontend API_BASE_URL to point to the new Vercel URL"
echo "3. Test all endpoints to ensure they work correctly"
