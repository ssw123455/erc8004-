#!/bin/bash

# ERC-8004 Trustless Agents Multi-Network Deployment Script
# Deploys to all Sepolia testnets: Ethereum, Base, Arbitrum, Optimism

set -e

echo "🚀 ERC-8004 Trustless Agents Multi-Network Deployment"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with your configuration."
    exit 1
fi

# Source environment variables
source .env

# Check required environment variables
required_vars=(
    "PRIVATE_KEY"
    "SEPOLIA_RPC_URL"
    "BASE_SEPOLIA_RPC_URL"
    "ARBITRUM_SEPOLIA_RPC_URL"
    "OPTIMISM_SEPOLIA_RPC_URL"
    "ETHERSCAN_API_KEY"
    "BASESCAN_API_KEY"
    "ARBISCAN_API_KEY"
    "OPTIMISTIC_ETHERSCAN_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Create deployments directory
mkdir -p deployments

# Deploy to Ethereum Sepolia
echo ""
echo "🔗 Deploying to Ethereum Sepolia..."
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify --slow | tee deployments/sepolia-deployment.log

# Deploy to Base Sepolia
echo ""
echo "🔗 Deploying to Base Sepolia..."
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify --slow | tee deployments/base_sepolia-deployment.log

# Deploy to Arbitrum Sepolia
echo ""
echo "🔗 Deploying to Arbitrum Sepolia..."
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify --slow | tee deployments/arbitrum_sepolia-deployment.log

# Deploy to Optimism Sepolia
echo ""
echo "🔗 Deploying to Optimism Sepolia..."
forge script script/Deploy.s.sol --rpc-url optimism_sepolia --broadcast --verify --slow | tee deployments/optimism_sepolia-deployment.log

echo ""
echo "🎉 All deployments completed!"
echo "📁 Deployment logs saved in deployments/ directory"
echo ""
echo "Next steps:"
echo "1. Extract contract addresses from deployment logs"
echo "2. Update web interface configuration"
echo "3. Update README with live contract addresses"
echo "4. Announce deployments to the community"
