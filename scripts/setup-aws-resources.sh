#!/bin/bash
set -e

# Setup AWS Resources for ClubCompass
# This script creates necessary AWS resources: SSM parameters, IAM roles, etc.
# Usage: ./scripts/setup-aws-resources.sh [prod|staging]

STAGE=${1:-staging}
REGION=${AWS_REGION:-us-east-1}

echo "🔧 Setting up AWS resources for ClubCompass (${STAGE})..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Create SSM parameters for sensitive configuration
echo "📝 Creating SSM parameters..."

# Database URL
read -p "Enter DATABASE_URL: " DATABASE_URL
aws ssm put-parameter \
    --name "/clubcompass/${STAGE}/database-url" \
    --value "${DATABASE_URL}" \
    --type "SecureString" \
    --region ${REGION} \
    --overwrite || echo "Parameter already exists"

# Redis URL
read -p "Enter REDIS_URL: " REDIS_URL
aws ssm put-parameter \
    --name "/clubcompass/${STAGE}/redis-url" \
    --value "${REDIS_URL}" \
    --type "String" \
    --region ${REGION} \
    --overwrite || echo "Parameter already exists"

# Secret Key
read -p "Enter SECRET_KEY (or press enter to generate): " SECRET_KEY
if [ -z "$SECRET_KEY" ]; then
    SECRET_KEY=$(openssl rand -hex 32)
    echo "Generated SECRET_KEY: ${SECRET_KEY}"
fi
aws ssm put-parameter \
    --name "/clubcompass/${STAGE}/secret-key" \
    --value "${SECRET_KEY}" \
    --type "SecureString" \
    --region ${REGION} \
    --overwrite || echo "Parameter already exists"

# Allowed Origins
read -p "Enter ALLOWED_ORIGINS (comma-separated): " ALLOWED_ORIGINS
aws ssm put-parameter \
    --name "/clubcompass/${STAGE}/allowed-origins" \
    --value "${ALLOWED_ORIGINS}" \
    --type "String" \
    --region ${REGION} \
    --overwrite || echo "Parameter already exists"

echo "✅ AWS resources setup completed!"
echo "📋 Created parameters:"
echo "  - /clubcompass/${STAGE}/database-url"
echo "  - /clubcompass/${STAGE}/redis-url"
echo "  - /clubcompass/${STAGE}/secret-key"
echo "  - /clubcompass/${STAGE}/allowed-origins"
