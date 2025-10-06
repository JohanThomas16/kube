#!/bin/bash

# Cleanup Kubernetes deployment
set -e

echo "🧹 Cleaning up Kube Credential from Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Delete all resources
echo "🗑️  Deleting all resources..."
kubectl delete -f k8s/ --ignore-not-found=true

# Wait for pods to terminate
echo "⏳ Waiting for pods to terminate..."
kubectl wait --for=delete pods --all -n kube-credential --timeout=60s || true

# Delete namespace (this will delete any remaining resources)
echo "📦 Deleting namespace..."
kubectl delete namespace kube-credential --ignore-not-found=true

echo "✅ Cleanup completed!"
echo ""
echo "🔍 Verify cleanup:"
kubectl get all -n kube-credential 2>/dev/null || echo "   Namespace 'kube-credential' not found (expected)"
