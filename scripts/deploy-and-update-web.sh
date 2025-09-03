#!/bin/bash

# Deploy contracts and update web interface configuration
# Usage: ./scripts/deploy-and-update-web.sh <network>

set -e

NETWORK=$1

if [ -z "$NETWORK" ]; then
    echo "❌ Usage: $0 <network>"
    echo "   Available networks: sepolia, base_sepolia, arbitrum_sepolia, optimism_sepolia"
    exit 1
fi

echo "🚀 Deploying ERC-8004 contracts to $NETWORK..."

# Deploy contracts and capture output
DEPLOY_OUTPUT=$(forge script script/Deploy.s.sol --rpc-url $NETWORK --broadcast 2>&1)
DEPLOY_EXIT_CODE=$?

echo "$DEPLOY_OUTPUT"

if [ $DEPLOY_EXIT_CODE -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

# Extract contract addresses from deployment output
IDENTITY_REGISTRY=$(echo "$DEPLOY_OUTPUT" | grep "IdentityRegistry deployed at:" | sed 's/.*IdentityRegistry deployed at: //')
REPUTATION_REGISTRY=$(echo "$DEPLOY_OUTPUT" | grep "ReputationRegistry deployed at:" | sed 's/.*ReputationRegistry deployed at: //')
VALIDATION_REGISTRY=$(echo "$DEPLOY_OUTPUT" | grep "ValidationRegistry deployed at:" | sed 's/.*ValidationRegistry deployed at: //')

if [ -z "$IDENTITY_REGISTRY" ] || [ -z "$REPUTATION_REGISTRY" ] || [ -z "$VALIDATION_REGISTRY" ]; then
    echo "❌ Could not extract contract addresses from deployment output"
    exit 1
fi

echo ""
echo "📋 Extracted contract addresses:"
echo "   Identity Registry: $IDENTITY_REGISTRY"
echo "   Reputation Registry: $REPUTATION_REGISTRY" 
echo "   Validation Registry: $VALIDATION_REGISTRY"

# Update web configuration
echo ""
echo "🔧 Updating web interface configuration..."

if [ -f "scripts/update-web-config.js" ]; then
    node scripts/update-web-config.js "$NETWORK" "$IDENTITY_REGISTRY" "$REPUTATION_REGISTRY" "$VALIDATION_REGISTRY"
    echo "✅ Web configuration updated successfully!"
else
    echo "⚠️  update-web-config.js not found, skipping web config update"
fi

echo ""
echo "🎉 Deployment and configuration complete!"
echo "   Network: $NETWORK"
echo "   Web interface: http://localhost:8000"
echo ""
echo "💡 To test the web interface:"
echo "   1. cd web && python3 -m http.server 8000"
echo "   2. Open http://localhost:8000 in your browser"
echo "   3. Connect your wallet and switch to $NETWORK network"
echo "   4. Register a test agent"
