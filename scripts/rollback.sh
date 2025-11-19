#!/bin/bash
set -e

# Rollback deployment
# Usage: ./scripts/rollback.sh [frontend|backend] [production|staging]

COMPONENT=${1:-frontend}
ENVIRONMENT=${2:-staging}

echo "⏪ Rolling back ${COMPONENT} in ${ENVIRONMENT}..."

if [ "$COMPONENT" = "frontend" ]; then
    echo "🌐 Rolling back frontend deployment..."
    cd frontend

    if [ "$ENVIRONMENT" = "production" ]; then
        echo "⚠️  WARNING: Rolling back PRODUCTION frontend!"
        read -p "Are you sure? (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            echo "❌ Rollback cancelled"
            exit 1
        fi
    fi

    # List recent deployments
    echo "📋 Recent deployments:"
    npx vercel ls

    read -p "Enter deployment URL to rollback to: " DEPLOYMENT_URL
    npx vercel rollback ${DEPLOYMENT_URL} --yes

    echo "✅ Frontend rollback completed!"

elif [ "$COMPONENT" = "backend" ]; then
    echo "🔧 Rolling back backend deployment..."
    cd backend

    if [ "$ENVIRONMENT" = "production" ]; then
        echo "⚠️  WARNING: Rolling back PRODUCTION backend!"
        read -p "Are you sure? (yes/no): " CONFIRM
        if [ "$CONFIRM" != "yes" ]; then
            echo "❌ Rollback cancelled"
            exit 1
        fi
        STAGE="prod"
    else
        STAGE="staging"
    fi

    # Serverless rollback
    echo "⏪ Rolling back to previous deployment..."
    serverless rollback --stage ${STAGE}

    echo "✅ Backend rollback completed!"
else
    echo "❌ Invalid component: ${COMPONENT}"
    echo "Usage: ./scripts/rollback.sh [frontend|backend] [production|staging]"
    exit 1
fi
