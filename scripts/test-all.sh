#!/bin/bash

# Run all tests across services
set -e

echo "🧪 Running all tests for Kube Credential..."

# Test issuance service
echo "🔬 Testing issuance service..."
cd services/issuance-service
npm test
echo "✅ Issuance service tests passed!"
cd ../..

# Test verification service
echo "🔬 Testing verification service..."
cd services/verification-service
npm test
echo "✅ Verification service tests passed!"
cd ../..

echo ""
echo "🎉 All tests passed successfully!"

# Optional: Run coverage reports
echo ""
echo "📊 Generating coverage reports..."

cd services/issuance-service
npm run test:coverage
cd ../..

cd services/verification-service
npm run test:coverage
cd ../..

echo "✅ Coverage reports generated!"
echo ""
echo "📈 Check coverage/ directories in each service for detailed reports"
