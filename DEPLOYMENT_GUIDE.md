# ERC-8004 Deployment Guide

This guide covers deploying the ERC-8004 Trustless Agents contracts and setting up the web interface.

##  Quick Start

### 1. Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation) installed
- Node.js (for web config updates)
- Wallet with testnet ETH
- RPC endpoints for target networks

### 2. Environment Setup

```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your settings
```

**Required .env variables:**
```bash
PRIVATE_KEY=0x1234567890abcdef...  # Must include 0x prefix
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
ETHERSCAN_API_KEY=your_etherscan_key_here  # Optional, for verification
```

### 3. Deploy to Single Network

```bash
# Deploy to Sepolia and update web config automatically
./scripts/deploy-and-update-web.sh sepolia
```

### 4. Test Web Interface

```bash
# Start local web server
cd web && python3 -m http.server 8000

# Open browser to http://localhost:8000
# Connect wallet, switch to deployed network, test registration
```

## 📋 Manual Deployment

### Deploy Contracts Only

```bash
# Deploy without web config update
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

### Update Web Config Manually

```bash
# Update web interface with deployed addresses
node scripts/update-web-config.js <network> <identity> <reputation> <validation>

# Example:
node scripts/update-web-config.js sepolia \
  0x127C86a24F46033E77C347258354ee4C739b139C \
  0x57396214E6E65E9B3788DE7705D5ABf3647764e0 \
  0x5d332cE798e491feF2de260bddC7f24978eefD85
```

##  Multi-Network Deployment

Deploy to all testnets:

```bash
./scripts/deploy-and-update-web.sh sepolia
./scripts/deploy-and-update-web.sh base_sepolia  
./scripts/deploy-and-update-web.sh arbitrum_sepolia
./scripts/deploy-and-update-web.sh optimism_sepolia
```

##  Web Interface Configuration

The web interface automatically loads contract addresses from `web/config.js`:

```javascript
window.CONTRACT_ADDRESSES = {
    sepolia: {
        identityRegistry: "0x...",
        reputationRegistry: "0x...", 
        validationRegistry: "0x..."
    },
    // ... other networks
};
```

### Configuration Loading Process

1. `web/config.js` loads first and sets `window.CONTRACT_ADDRESSES`
2. `web/app.js` loads and calls `loadContractAddresses()`
3. Contract addresses are merged into network configurations
4. UI displays deployed contracts and enables registration

## 📊 Deployment Verification

After deployment, verify:

1. **Contracts deployed** - Check explorer links in deployment output
2. **Web config updated** - Refresh browser, should show contract addresses
3. **Registration works** - Connect wallet and test agent registration
4. **Events emitted** - Check transaction logs for `AgentRegistered` events

##  Troubleshooting

### Common Issues

**"ethers is not defined"**
- Refresh browser to reload ethers.js library
- Check browser console for loading errors

**"Contracts not deployed on this network yet"**
- Verify web config was updated: check `web/config.js`
- Ensure browser cache is cleared
- Check network selection matches deployed network

**"Invalid API Key" during verification**
- Add `ETHERSCAN_API_KEY` to `.env` file
- Or skip verification: remove `--verify` flag

**Deployment fails with "missing hex prefix"**
- Ensure `PRIVATE_KEY` in `.env` starts with `0x`

### Network-Specific Notes

**Sepolia**: Most stable, recommended for initial testing
**Base Sepolia**: Fast and cheap transactions  
**Arbitrum Sepolia**: L2 scaling benefits
**Optimism Sepolia**: Optimistic rollup features

##  Security Notes

- Never commit `.env` file to version control
- Use separate wallets for testnet and mainnet
- Verify contract addresses before interacting
- Test thoroughly on testnets before mainnet deployment

##  Additional Resources

- [ERC-8004 Specification](https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098)
- [Reference Implementation](https://github.com/ChaosChain/trustless-agents-erc-ri)
- [Foundry Documentation](https://book.getfoundry.sh/)
- [Web3 Frontend Guide](web/README.md)
