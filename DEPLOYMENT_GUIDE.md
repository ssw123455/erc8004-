# ERC-8004 Trustless Agents Deployment Guide

This guide walks you through deploying the ERC-8004 reference implementation to multiple testnets and setting up the web interface.

## 🚀 Quick Start

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs for testnets
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io

# API Keys for contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
ARBISCAN_API_KEY=your_arbiscan_api_key
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimistic_etherscan_api_key
```

### 2. Deploy to All Testnets

```bash
# Deploy to all four Sepolia testnets
./scripts/deploy-all-testnets.sh
```

### 3. Update Web Interface

```bash
# Extract addresses from deployment logs and update web config
node scripts/update-web-config.js
```

### 4. Test Web Interface

Open `web/index.html` in your browser to test agent registration.

## 📋 Detailed Steps

### Prerequisites

1. **Foundry installed**: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
2. **Node.js installed**: For running the config update script
3. **Testnet ETH**: Get from faucets for each network
4. **API Keys**: For contract verification on block explorers

### Network Information

| Network | Chain ID | Faucet | Explorer |
|---------|----------|--------|----------|
| Ethereum Sepolia | 11155111 | [Sepolia Faucet](https://sepoliafaucet.com/) | [Sepolia Etherscan](https://sepolia.etherscan.io) |
| Base Sepolia | 84532 | [Base Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet) | [Base Sepolia Scan](https://sepolia.basescan.org) |
| Arbitrum Sepolia | 421614 | [Arbitrum Faucet](https://faucet.triangleplatform.com/arbitrum/sepolia) | [Arbitrum Sepolia Scan](https://sepolia.arbiscan.io) |
| Optimism Sepolia | 11155420 | [Optimism Faucet](https://app.optimism.io/faucet) | [Optimism Sepolia Scan](https://sepolia-optimistic.etherscan.io) |

### Manual Deployment (Single Network)

Deploy to a specific network:

```bash
# Deploy to Ethereum Sepolia
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify

# Deploy to Base Sepolia
forge script script/Deploy.s.sol --rpc-url base_sepolia --broadcast --verify

# Deploy to Arbitrum Sepolia
forge script script/Deploy.s.sol --rpc-url arbitrum_sepolia --broadcast --verify

# Deploy to Optimism Sepolia
forge script script/Deploy.s.sol --rpc-url optimism_sepolia --broadcast --verify
```

### Verification (if auto-verification fails)

```bash
# Verify contracts manually
forge verify-contract <CONTRACT_ADDRESS> src/IdentityRegistry.sol:IdentityRegistry --chain sepolia
forge verify-contract <CONTRACT_ADDRESS> src/ReputationRegistry.sol:ReputationRegistry --chain sepolia --constructor-args $(cast abi-encode "constructor(address)" <IDENTITY_REGISTRY_ADDRESS>)
forge verify-contract <CONTRACT_ADDRESS> src/ValidationRegistry.sol:ValidationRegistry --chain sepolia --constructor-args $(cast abi-encode "constructor(address)" <IDENTITY_REGISTRY_ADDRESS>)
```

## 🌐 Web Interface Setup

### Features

- **Multi-network support**: Switch between all four testnets
- **Wallet integration**: MetaMask and other Web3 wallets
- **Real-time registration**: Direct interaction with deployed contracts
- **Network detection**: Auto-detects and switches networks
- **Transaction tracking**: Links to block explorers

### Local Development

1. **Serve the web interface**:
   ```bash
   # Using Python
   cd web && python -m http.server 8000
   
   # Using Node.js
   cd web && npx serve
   
   # Using PHP
   cd web && php -S localhost:8000
   ```

2. **Open in browser**: `http://localhost:8000`

### Production Deployment

Deploy to any static hosting service:

- **GitHub Pages**: Push `web/` directory to `gh-pages` branch
- **Netlify**: Connect repository and set build directory to `web/`
- **Vercel**: Deploy `web/` directory
- **IPFS**: Upload `web/` directory for decentralized hosting

## 📊 Gas Costs

Estimated gas costs for registration:

| Network | Registration Cost | USD (at 20 gwei) |
|---------|------------------|-------------------|
| Ethereum Sepolia | ~142,000 gas | ~$0.60 |
| Base Sepolia | ~142,000 gas | ~$0.01 |
| Arbitrum Sepolia | ~142,000 gas | ~$0.02 |
| Optimism Sepolia | ~142,000 gas | ~$0.02 |

## 🔧 Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Get testnet ETH from faucets
2. **"Network not supported"**: Add network to MetaMask manually
3. **"Contract not verified"**: Run verification commands manually
4. **"Transaction failed"**: Check if domain is already registered

### Debug Commands

```bash
# Check deployment status
forge script script/Deploy.s.sol --rpc-url sepolia --simulate

# Test contract interaction
cast call <IDENTITY_REGISTRY_ADDRESS> "resolveByDomain(string)" "example.com" --rpc-url sepolia

# Check transaction status
cast tx <TX_HASH> --rpc-url sepolia
```

## 📈 Monitoring

### Block Explorer Links

After deployment, monitor your contracts:

- **Ethereum Sepolia**: `https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>`
- **Base Sepolia**: `https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>`
- **Arbitrum Sepolia**: `https://sepolia.arbiscan.io/address/<CONTRACT_ADDRESS>`
- **Optimism Sepolia**: `https://sepolia-optimistic.etherscan.io/address/<CONTRACT_ADDRESS>`

### Event Monitoring

Watch for `AgentRegistered` events:

```bash
cast logs --from-block latest --address <IDENTITY_REGISTRY_ADDRESS> --rpc-url sepolia
```

## 🎯 Next Steps

1. **Community Announcement**: Share contract addresses on social media
2. **Developer Docs**: Create integration guides for other projects
3. **Bug Bounty**: Set up rewards for finding issues
4. **Mainnet Deployment**: Deploy to production networks after testing
5. **Ecosystem Building**: Reach out to potential integrators

## 🔗 Resources

- **ERC-8004 Specification**: [Ethereum Magicians Discussion](https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098)
- **GitHub Repository**: [trustless-agents-erc-ri](https://github.com/ChaosChain/trustless-agents-erc-ri)
- **Foundry Documentation**: [book.getfoundry.sh](https://book.getfoundry.sh/)
- **Web3 Integration**: [ethers.js Documentation](https://docs.ethers.io/v5/)

---

**Ready to deploy?** Run `./scripts/deploy-all-testnets.sh` and let's build the trustless agent economy! 🚀
