#!/bin/bash

# Build all services and frontend
set -e

echo "🏗️  Building Kube Credential services..."

# Build backend services
echo "📦 Building issuance service..."
cd services/issuance-service
npm run build
cd ../..

echo "📦 Building verification service..."
cd services/verification-service
npm run build
cd ../..

# Build frontend
echo "🎨 Building frontend..."
cd frontend
npm run build
cd ..

echo "✅ All builds completed successfully!"

# Build Docker images
echo "🐳 Building Docker images..."
docker build -t kube-credential/issuance-service ./services/issuance-service
docker build -t kube-credential/verification-service ./services/verification-service
docker build -t kube-credential/frontend ./frontend

echo "✅ All Docker images built successfully!"
echo ""
echo "🚀 Ready for deployment!"
echo "   - Run 'docker-compose up' for local testing"
echo "   - Run 'kubectl apply -f k8s/' for Kubernetes deployment"
