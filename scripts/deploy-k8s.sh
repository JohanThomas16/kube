#!/bin/bash

# Deploy to Kubernetes
set -e

echo "☸️  Deploying Kube Credential to Kubernetes..."

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster"
    echo "   Please ensure kubectl is configured correctly"
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Apply namespace first
echo "📦 Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Apply deployments and services
echo "🚀 Deploying services..."
kubectl apply -f k8s/issuance-deployment.yaml
kubectl apply -f k8s/issuance-service.yaml
kubectl apply -f k8s/verification-deployment.yaml
kubectl apply -f k8s/verification-service.yaml

# Wait for deployments to be ready
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/issuance-service -n kube-credential
kubectl wait --for=condition=available --timeout=300s deployment/verification-service -n kube-credential

echo "✅ Services deployed successfully!"

# Apply optional components
echo "🌐 Applying optional components..."

# Check if NGINX Ingress Controller is available
if kubectl get ingressclass nginx &> /dev/null; then
    echo "📡 Deploying Ingress..."
    kubectl apply -f k8s/ingress.yaml
else
    echo "⚠️  NGINX Ingress Controller not found, skipping Ingress deployment"
    echo "   Install with: kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml"
fi

# Check if Metrics Server is available
if kubectl get apiservice v1beta1.metrics.k8s.io &> /dev/null; then
    echo "📊 Deploying HPA..."
    kubectl apply -f k8s/issuance-hpa.yaml
    kubectl apply -f k8s/verification-hpa.yaml
else
    echo "⚠️  Metrics Server not found, skipping HPA deployment"
    echo "   Install with: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Status:"
kubectl get pods -n kube-credential
echo ""
kubectl get services -n kube-credential
echo ""

# Show access instructions
echo "🔗 Access your services:"
echo "   Port forward: kubectl port-forward -n kube-credential svc/issuance-service 3001:80"
echo "   Port forward: kubectl port-forward -n kube-credential svc/verification-service 3002:80"

if kubectl get ingress -n kube-credential &> /dev/null; then
    echo "   Ingress: Add 'kube-credential.local' to your /etc/hosts"
fi

echo ""
echo "🔍 Monitor with:"
echo "   kubectl logs -f -n kube-credential deployment/issuance-service"
echo "   kubectl logs -f -n kube-credential deployment/verification-service"
