#!/bin/bash
set -e

# Deploy Frontend to Vercel
# Usage: ./scripts/deploy-frontend.sh [production|staging]

ENVIRONMENT=${1:-staging}

echo "🚀 Deploying frontend to ${ENVIRONMENT}..."

cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm test -- --passWithNoTests

# Type check
echo "🔍 Type checking..."
npm run type-check

# Lint
echo "✨ Linting..."
npm run lint

# Build
echo "🏗️  Building application..."
npm run build

# Deploy
echo "🚢 Deploying to Vercel..."
if [ "$ENVIRONMENT" = "production" ]; then
  npx vercel --prod --yes
else
  npx vercel --yes
fi

echo "✅ Frontend deployed successfully to ${ENVIRONMENT}!"
