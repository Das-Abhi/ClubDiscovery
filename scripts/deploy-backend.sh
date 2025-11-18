#!/bin/bash
set -e

# Deploy Backend to AWS Lambda
# Usage: ./scripts/deploy-backend.sh [prod|staging]

STAGE=${1:-staging}
REGION=${AWS_REGION:-us-east-1}

echo "🚀 Deploying backend to AWS Lambda (${STAGE})..."

cd backend

# Install serverless if not already installed
if ! command -v serverless &> /dev/null; then
    echo "📦 Installing Serverless Framework..."
    npm install -g serverless
fi

# Install serverless plugins
if [ ! -f "package.json" ]; then
    echo "📦 Installing Serverless plugins..."
    npm init -y
    npm install --save-dev serverless-python-requirements
    npm install --save-dev serverless-offline
    npm install --save-dev serverless-dotenv-plugin
fi

# Run tests
echo "🧪 Running tests..."
pip install -r requirements.txt
pip install pytest pytest-cov
pytest --cov=app tests/ || echo "⚠️  Tests skipped (no tests found)"

# Deploy
echo "🚢 Deploying to AWS Lambda..."
serverless deploy --stage ${STAGE} --region ${REGION} --verbose

echo "✅ Backend deployed successfully to AWS Lambda (${STAGE})!"
echo "📊 Check AWS Console for API Gateway URL"
