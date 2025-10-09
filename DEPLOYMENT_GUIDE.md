# ERC-8004 v1.0 - Multi-Chain Deployment Guide

## 🎯 Overview

This guide covers deploying ERC-8004 v1.0 contracts to:
- ✅ Ethereum Sepolia
- ✅ Base Sepolia  
- ✅ Optimism Sepolia
- ✅ Mode Testnet
- ✅ 0G Testnet

---

## 📋 Prerequisites

### 1. **Install Required Tools**

```bash
# Foundry (if not installed)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify installation
forge --version  # Should show 0.2.0+
```

### 2. **Get Testnet Tokens**

| Network | Token | Faucet Link |
|---------|-------|-------------|
| Ethereum Sepolia | SepoliaETH | https://sepoliafaucet.com/ |
| Base Sepolia | SepoliaETH | https://www.coinbase.com/faucets/base-ethereum-goerli-faucet |
| Optimism Sepolia | SepoliaETH | https://app.optimism.io/faucet |
| Mode Testnet | ETH | https://sepolia-bridge.mode.network/ (bridge from Sepolia) |
| 0G Testnet | OG | https://faucet.0g.ai/ |

**Recommended**: Get ~0.1 ETH (or equivalent) on each network for deployment + testing.

### 3. **Get Block Explorer API Keys**

Required for contract verification:

- **Etherscan** (Sepolia): https://etherscan.io/myapikey
- **Basescan** (Base): https://basescan.org/myapikey
- **Optimistic Etherscan** (Optimism): https://optimistic.etherscan.io/myapikey
- **Mode Scan**: No API key needed (uses Blockscout)
- **0G Scan**: No API key needed (manual verification)

---

## 🔧 Setup

### Step 1: Configure Environment

Create a `.env` file in the project root:

```bash
# IMPORTANT: Never commit this file!
# Add .env to .gitignore

# Deployer Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
OPTIMISM_SEPOLIA_RPC_URL=https://sepolia.optimism.io
MODE_TESTNET_RPC_URL=https://sepolia.mode.network
ZG_TESTNET_RPC_URL=https://evmrpc-testnet.0g.ai

# Block Explorer API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
BASESCAN_API_KEY=your_basescan_api_key
OPTIMISTIC_ETHERSCAN_API_KEY=your_optimism_api_key
```

**Getting RPC URLs:**
- Alchemy: https://www.alchemy.com/ (recommended for Sepolia)
- Infura: https://www.infura.io/
- Public RPCs: Use defaults above for Base/Optimism/0G

### Step 2: Load Environment Variables

```bash
source .env
```

### Step 3: Verify Setup

```bash
# Check private key is set
echo $PRIVATE_KEY | wc -c  # Should be 65 (64 chars + newline)

# Check RPC connectivity
cast chain-id --rpc-url $SEPOLIA_RPC_URL
cast chain-id --rpc-url $BASE_SEPOLIA_RPC_URL
cast chain-id --rpc-url $OPTIMISM_SEPOLIA_RPC_URL
cast chain-id --rpc-url $ZG_TESTNET_RPC_URL

# Check wallet balances
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url $SEPOLIA_RPC_URL
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url $BASE_SEPOLIA_RPC_URL
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url $OPTIMISM_SEPOLIA_RPC_URL
cast balance $(cast wallet address $PRIVATE_KEY) --rpc-url $ZG_TESTNET_RPC_URL
```

---

## 🚀 Deployment

### Option 1: Automated Script (Recommended)

```bash
# Deploy to a single network
./deploy.sh sepolia
./deploy.sh base_sepolia
./deploy.sh optimism_sepolia
./deploy.sh zg_testnet

# Or deploy to all networks at once
./deploy.sh all
```

### Option 2: Manual Deployment

#### Deploy to Ethereum Sepolia

```bash
forge script script/Deploy.s.sol:Deploy \
    --rpc-url sepolia \
    --broadcast \
    --verify \
    -vvv
```

#### Deploy to Base Sepolia

```bash
forge script script/Deploy.s.sol:Deploy \
    --rpc-url base_sepolia \
    --broadcast \
    --verify \
    -vvv
```

#### Deploy to Optimism Sepolia

```bash
forge script script/Deploy.s.sol:Deploy \
    --rpc-url optimism_sepolia \
    --broadcast \
    --verify \
    -vvv
```

#### Deploy to Mode Testnet

```bash
# Mode uses Blockscout for verification
forge script script/Deploy.s.sol:Deploy \
    --rpc-url mode_testnet \
    --broadcast \
    --verify \
    --verifier blockscout \
    --verifier-url https://sepolia.explorer.mode.network/api\? \
    -vvv
```

#### Deploy to 0G Testnet

```bash
# Note: Verification via forge not yet supported on 0G
# Use manual verification on 0G Scan after deployment

forge script script/Deploy.s.sol:Deploy \
    --rpc-url zg_testnet \
    --broadcast \
    -vvv
```

---

## ✅ Verification

### Automatic Verification (Etherscan-based chains)

If `--verify` flag was used, contracts are automatically verified. Check status:

```bash
# Sepolia
https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>

# Base Sepolia
https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>

# Optimism Sepolia
https://sepolia-optimistic.etherscan.io/address/<CONTRACT_ADDRESS>
```

### Manual Verification (If automatic fails)

#### For Ethereum/Base/Optimism:

```bash
forge verify-contract <CONTRACT_ADDRESS> \
    src/IdentityRegistry.sol:IdentityRegistry \
    --chain-id <CHAIN_ID> \
    --etherscan-api-key <API_KEY>

forge verify-contract <CONTRACT_ADDRESS> \
    src/ReputationRegistry.sol:ReputationRegistry \
    --constructor-args $(cast abi-encode "constructor(address)" <IDENTITY_REGISTRY_ADDRESS>) \
    --chain-id <CHAIN_ID> \
    --etherscan-api-key <API_KEY>

forge verify-contract <CONTRACT_ADDRESS> \
    src/ValidationRegistry.sol:ValidationRegistry \
    --constructor-args $(cast abi-encode "constructor(address)" <IDENTITY_REGISTRY_ADDRESS>) \
    --chain-id <CHAIN_ID> \
    --etherscan-api-key <API_KEY>
```

**Chain IDs:**
- Sepolia: `11155111`
- Base Sepolia: `84532`
- Optimism Sepolia: `11155420`
- 0G Testnet: `16601`

#### For 0G Testnet:

1. Go to [0G Scan](https://chainscan-newton.0g.ai/)
2. Find your contract address
3. Click "Contract" → "Verify & Publish"
4. Fill in:
   - **Compiler**: 0.8.19
   - **Optimization**: Yes (200 runs)
   - **EVM Version**: cancun
   - **License**: CC0-1.0
5. Paste flattened source:
   ```bash
   forge flatten src/IdentityRegistry.sol > IdentityRegistry_flat.sol
   forge flatten src/ReputationRegistry.sol > ReputationRegistry_flat.sol
   forge flatten src/ValidationRegistry.sol > ValidationRegistry_flat.sol
   ```

---

## 📊 Post-Deployment

### 1. Save Deployment Addresses

Create `deployments.json`:

```json
{
  "sepolia": {
    "chainId": 11155111,
    "identityRegistry": "0x...",
    "reputationRegistry": "0x...",
    "validationRegistry": "0x..."
  },
  "base_sepolia": {
    "chainId": 84532,
    "identityRegistry": "0x...",
    "reputationRegistry": "0x...",
    "validationRegistry": "0x..."
  },
  "optimism_sepolia": {
    "chainId": 11155420,
    "identityRegistry": "0x...",
    "reputationRegistry": "0x...",
    "validationRegistry": "0x..."
  },
  "zg_testnet": {
    "chainId": 16601,
    "identityRegistry": "0x...",
    "reputationRegistry": "0x...",
    "validationRegistry": "0x..."
  }
}
```

### 2. Test Deployments

```bash
# Test agent registration
cast send <IDENTITY_REGISTRY> \
    "register(string)" \
    "ipfs://QmTest..." \
    --rpc-url <RPC_URL> \
    --private-key $PRIVATE_KEY

# Verify registration
cast call <IDENTITY_REGISTRY> \
    "totalAgents()(uint256)" \
    --rpc-url <RPC_URL>
```

### 3. Update README

Add deployment addresses to README.md under appropriate sections.

---

## 🐛 Troubleshooting

### Issue: "Insufficient funds"
**Solution**: Get more testnet tokens from faucets.

### Issue: "Invalid opcode" on 0G
**Solution**: Ensure Solidity version is 0.8.19 (not 0.8.26+). Our contracts are already set correctly.

### Issue: "Verification failed"
**Solution**: 
1. Check API key is correct
2. Wait 1-2 minutes after deployment
3. Try manual verification
4. Use `forge flatten` for complex imports

### Issue: "Nonce too low/high"
**Solution**: 
```bash
# Reset nonce
cast nonce $(cast wallet address $PRIVATE_KEY) --rpc-url <RPC_URL>
```

### Issue: "RPC timeout"
**Solution**: Use alternative RPC (Alchemy, Infura, or public RPCs).

---

## 📝 Network Details

| Network | Chain ID | Block Time | Gas Token | Explorer |
|---------|----------|------------|-----------|----------|
| Ethereum Sepolia | 11155111 | 12s | SepoliaETH | https://sepolia.etherscan.io |
| Base Sepolia | 84532 | 2s | SepoliaETH | https://sepolia.basescan.org |
| Optimism Sepolia | 11155420 | 2s | SepoliaETH | https://sepolia-optimistic.etherscan.io |
| Mode Testnet | 919 | 2s | ETH | https://sepolia.explorer.mode.network |
| 0G Testnet | 16602 | 1-2s | OG | https://chainscan-galileo.0g.ai |

---

## 🔐 Security Reminders

1. ⚠️  **NEVER commit `.env` file** (it's in `.gitignore`)
2. ⚠️  **Use separate deployer keys** for testnet/mainnet
3. ⚠️  **Verify all contract code** before mainnet deployment
4. ⚠️  **Test thoroughly** on testnets before mainnet
5. ⚠️  **Keep private keys secure** (use hardware wallet for mainnet)

---

## 📚 Additional Resources

- **0G Documentation**: https://docs.0g.ai/
- **Foundry Book**: https://book.getfoundry.sh/
- **ERC-8004 Spec**: [ERC-8004-v1.md](./ERC-8004-v1.md)

---

**Need help?** Open an issue or join our Discord.
