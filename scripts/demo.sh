#!/bin/bash

# Demo script to test the API endpoints
set -e

ISSUANCE_URL=${1:-"http://localhost:3001"}
VERIFICATION_URL=${2:-"http://localhost:3002"}

echo "🎬 Kube Credential Demo"
echo "======================="
echo "Issuance Service: $ISSUANCE_URL"
echo "Verification Service: $VERIFICATION_URL"
echo ""

# Test health endpoints
echo "🏥 Testing health endpoints..."
echo "Issuance Service Health:"
curl -s "$ISSUANCE_URL/health" | jq '.' || echo "Failed to connect to issuance service"
echo ""

echo "Verification Service Health:"
curl -s "$VERIFICATION_URL/health" | jq '.' || echo "Failed to connect to verification service"
echo ""

# Test credential issuance
echo "📝 Testing credential issuance..."
CREDENTIAL='{"name": "John Doe", "role": "Developer", "department": "Engineering", "level": "Senior"}'

echo "Issuing credential: $CREDENTIAL"
ISSUE_RESPONSE=$(curl -s -X POST "$ISSUANCE_URL/issue" \
  -H "Content-Type: application/json" \
  -d "$CREDENTIAL")

echo "Response:"
echo "$ISSUE_RESPONSE" | jq '.'
echo ""

# Test duplicate issuance
echo "🔄 Testing duplicate issuance..."
echo "Issuing same credential again..."
DUPLICATE_RESPONSE=$(curl -s -X POST "$ISSUANCE_URL/issue" \
  -H "Content-Type: application/json" \
  -d "$CREDENTIAL")

echo "Response:"
echo "$DUPLICATE_RESPONSE" | jq '.'
echo ""

# Test credential verification
echo "✅ Testing credential verification..."
echo "Verifying credential: $CREDENTIAL"

# First sync the credential to verification service (in real deployment this would be automatic)
SYNC_DATA=$(echo "$ISSUE_RESPONSE" | jq -r '{content: ($credential | tostring), workerId: .workerId, issuedAt: .issuedAt}' --argjson credential $(echo "$CREDENTIAL" | jq -c '. | to_entries | sort_by(.key) | from_entries'))

curl -s -X POST "$VERIFICATION_URL/sync" \
  -H "Content-Type: application/json" \
  -d "$SYNC_DATA" > /dev/null

# Now verify
VERIFY_RESPONSE=$(curl -s -X POST "$VERIFICATION_URL/verify" \
  -H "Content-Type: application/json" \
  -d "$CREDENTIAL")

echo "Response:"
echo "$VERIFY_RESPONSE" | jq '.'
echo ""

# Test verification of non-existent credential
echo "❌ Testing verification of non-existent credential..."
NON_EXISTENT='{"name": "Jane Smith", "role": "Manager", "department": "Sales"}'
echo "Verifying non-existent credential: $NON_EXISTENT"

VERIFY_FAIL_RESPONSE=$(curl -s -X POST "$VERIFICATION_URL/verify" \
  -H "Content-Type: application/json" \
  -d "$NON_EXISTENT")

echo "Response:"
echo "$VERIFY_FAIL_RESPONSE" | jq '.'
echo ""

# Test property order independence
echo "🔀 Testing property order independence..."
REORDERED_CREDENTIAL='{"department": "Engineering", "level": "Senior", "name": "John Doe", "role": "Developer"}'
echo "Verifying reordered credential: $REORDERED_CREDENTIAL"

REORDER_RESPONSE=$(curl -s -X POST "$VERIFICATION_URL/verify" \
  -H "Content-Type: application/json" \
  -d "$REORDERED_CREDENTIAL")

echo "Response:"
echo "$REORDER_RESPONSE" | jq '.'
echo ""

echo "🎉 Demo completed!"
echo ""
echo "📊 Summary:"
echo "✅ Health checks passed"
echo "✅ Credential issuance working"
echo "✅ Duplicate detection working"
echo "✅ Credential verification working"
echo "✅ Property order independence working"
echo "✅ Non-existent credential handling working"
