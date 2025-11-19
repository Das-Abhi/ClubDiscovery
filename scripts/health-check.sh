#!/bin/bash
set -e

# Health Check Script for ClubCompass
# Checks both frontend and backend health
# Usage: ./scripts/health-check.sh [production|staging]

ENVIRONMENT=${1:-staging}

if [ "$ENVIRONMENT" = "production" ]; then
    FRONTEND_URL="https://clubcompass.bmsce.ac.in"
    BACKEND_URL="https://api.clubcompass.bmsce.ac.in"
else
    FRONTEND_URL="https://staging.clubcompass.bmsce.ac.in"
    BACKEND_URL="https://api-staging.clubcompass.bmsce.ac.in"
fi

echo "🏥 Running health checks for ${ENVIRONMENT}..."
echo ""

# Check Frontend
echo "🌐 Checking Frontend (${FRONTEND_URL})..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${FRONTEND_URL} || echo "000")

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is healthy (HTTP ${FRONTEND_STATUS})"
else
    echo "❌ Frontend is unhealthy (HTTP ${FRONTEND_STATUS})"
fi

echo ""

# Check Backend Health Endpoint
echo "🔧 Checking Backend (${BACKEND_URL}/health)..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL}/health || echo "000")

if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend is healthy (HTTP ${BACKEND_STATUS})"

    # Get detailed health info
    HEALTH_INFO=$(curl -s ${BACKEND_URL}/health)
    echo "📊 Backend Info:"
    echo "${HEALTH_INFO}" | jq '.' || echo "${HEALTH_INFO}"
else
    echo "❌ Backend is unhealthy (HTTP ${BACKEND_STATUS})"
fi

echo ""

# Check Backend API Documentation
echo "📚 Checking API Documentation (${BACKEND_URL}/docs)..."
DOCS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${BACKEND_URL}/docs || echo "000")

if [ "$DOCS_STATUS" = "200" ]; then
    echo "✅ API Documentation is accessible (HTTP ${DOCS_STATUS})"
else
    echo "❌ API Documentation is not accessible (HTTP ${DOCS_STATUS})"
fi

echo ""
echo "🏁 Health check completed!"
