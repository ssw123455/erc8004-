# ERC-8004 Trustless Agents Reference Implementation

**Reference implementation** for **[ERC-8004 Trustless Agents v1.0](https://eips.ethereum.org/EIPS/eip-8004)** - a trust layer that enables participants to discover, choose, and interact with agents across organizational boundaries without pre-existing trust.

## Overview

This repository provides a complete, production-ready implementation of all three core registry contracts defined in the ERC-8004 v1.0 specification:

- **Identity Registry** - ERC-721 based agent identity with URIStorage for registration files
- **Reputation Registry** - On-chain feedback storage with EIP-191/ERC-1271 signature verification
- **Validation Registry** - Independent work validation with URI-based evidence and tags

## Version 1.0

This implementation is **100% compliant with ERC-8004 v1.0** specification with:
- ✅ **76/76 tests passing** (100% coverage)
- ✅ **EIP-191/ERC-1271 signature verification** (not EIP-712)
- ✅ **Gas optimized** with IR compiler
- ✅ **Battle-tested** and ready for mainnet deployment

**📁 Implementation Location**: All v1.0 contracts are in [`src/v1/`](./src/v1/)

## Architecture

### Core Contracts (v1.0)

| Contract | Purpose | Key Features |
|----------|---------|--------------|
| `IdentityRegistry` | ERC-721 agent NFTs | URIStorage, on-chain metadata, transferable ownership |
| `ReputationRegistry` | Feedback system | EIP-191/ERC-1271 signatures, on-chain scores, tags |
| `ValidationRegistry` | Work validation | URI evidence, tags, multiple responses per request |

### Design Principles

- **ERC-721 Native** - Agents are NFTs, instantly compatible with NFT infrastructure
- **Signature-Based Auth** - EIP-191 for EOAs, ERC-1271 for smart contracts
- **On-Chain Composability** - Scores and tags stored on-chain for smart contract access
- **Off-Chain Scalability** - Detailed data via URIs (IPFS recommended)
- **Event-Driven** - Comprehensive events for indexing and off-chain aggregation

## Quick Start

### Prerequisites

- [Foundry](https://book.getfoundry.sh/) installed
- Node.js 16+ (optional, for web interface)

### Installation

```bash
git clone https://github.com/ChaosChain/trustless-agents-erc-ri.git
cd trustless-agents-erc-ri
forge install
```

### Build & Test

```bash
# Build contracts
forge build

# Run all v1.0 tests (76 tests, 100% pass rate)
forge test --match-path "test/v1/*.t.sol"

# Run with verbose output
forge test --match-path "test/v1/*.t.sol" -vv

# Run specific test file
forge test --match-path test/v1/IdentityRegistry.t.sol
forge test --match-path test/v1/ReputationRegistry.t.sol
forge test --match-path test/v1/ValidationRegistry.t.sol
```

### Deploy

```bash
# Configure environment
cp .env.example .env
# Edit .env with your settings

# Deploy all three contracts
forge script script/DeployV1.s.sol:DeployV1 --rpc-url sepolia --broadcast --verify

# Or deploy individually
forge script script/DeployV1.s.sol:DeployIdentityOnly --rpc-url sepolia --broadcast --verify
forge script script/DeployV1.s.sol:DeployReputationOnly --rpc-url sepolia --broadcast --verify
forge script script/DeployV1.s.sol:DeployValidationOnly --rpc-url sepolia --broadcast --verify
```

## Contract Specifications (v1.0)

### Identity Registry

**Purpose**: ERC-721 based agent registry with URIStorage

```solidity
interface IIdentityRegistry {
    // Registration
    function register(string tokenURI, MetadataEntry[] metadata) returns (uint256 agentId);
    function register(string tokenURI) returns (uint256 agentId);
    function register() returns (uint256 agentId);
    
    // Metadata
    function setMetadata(uint256 agentId, string key, bytes value) external;
    function getMetadata(uint256 agentId, string key) returns (bytes value);
    
    // ERC-721 standard functions
    function ownerOf(uint256 agentId) returns (address);
    function tokenURI(uint256 agentId) returns (string);
    function transferFrom(address from, address to, uint256 agentId) external;
    // ... and all other ERC-721 functions
}
```

**Key Features**:
- ERC-721 compliant (agents are NFTs)
- URIStorage for registration files (ipfs://, https://, etc.)
- On-chain key-value metadata storage
- Transferable ownership
- Operator support via ERC-721 approvals

**Registration File Format** (pointed to by tokenURI):
```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "myAgentName",
  "description": "Agent description",
  "image": "https://example.com/agent.png",
  "endpoints": [
    {"name": "A2A", "endpoint": "https://agent.example/.well-known/agent-card.json"},
    {"name": "MCP", "endpoint": "https://mcp.agent.eth/"},
    {"name": "agentWallet", "endpoint": "eip155:1:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"}
  ],
  "registrations": [
    {"agentId": 22, "agentRegistry": "eip155:1:{identityRegistry}"}
  ],
  "supportedTrust": ["reputation", "crypto-economic", "tee-attestation"]
}
```

### Reputation Registry

**Purpose**: On-chain feedback storage with cryptographic authorization

```solidity
interface IReputationRegistry {
    // Give feedback
    function giveFeedback(
        uint256 agentId,
        uint8 score,              // 0-100
        bytes32 tag1,             // optional
        bytes32 tag2,             // optional
        string fileuri,           // optional
        bytes32 filehash,         // optional (not needed for IPFS)
        bytes feedbackAuth        // EIP-191/ERC-1271 signature
    ) external;
    
    // Revoke feedback
    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external;
    
    // Append response
    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string responseUri,
        bytes32 responseHash      // optional for IPFS
    ) external;
    
    // Read functions
    function getSummary(uint256 agentId, address[] clientAddresses, bytes32 tag1, bytes32 tag2) 
        returns (uint64 count, uint8 averageScore);
    function readFeedback(uint256 agentId, address clientAddress, uint64 index) 
        returns (uint8 score, bytes32 tag1, bytes32 tag2, bool isRevoked);
    function readAllFeedback(uint256 agentId, address[] clientAddresses, bytes32 tag1, bytes32 tag2, bool includeRevoked)
        returns (address[], uint8[], bytes32[], bytes32[], bool[]);
    function getClients(uint256 agentId) returns (address[]);
    function getLastIndex(uint256 agentId, address clientAddress) returns (uint64);
}
```

**Key Features**:
- **EIP-191/ERC-1271 signatures** (NOT EIP-712)
- On-chain storage: score, tag1, tag2, isRevoked
- Off-chain storage: fileuri, filehash (in events only)
- Filtering by clientAddresses and tags
- Anyone can append responses
- Composable with smart contracts

**FeedbackAuth Structure**:
```solidity
struct FeedbackAuth {
    uint256 agentId;
    address clientAddress;
    uint64 indexLimit;
    uint256 expiry;
    uint256 chainId;
    address identityRegistry;
    address signerAddress;
}
```

### Validation Registry

**Purpose**: Independent work validation with URI-based evidence

```solidity
interface IValidationRegistry {
    // Request validation
    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string requestUri,
        bytes32 requestHash        // optional for IPFS
    ) external;
    
    // Respond to validation
    function validationResponse(
        bytes32 requestHash,
        uint8 response,            // 0-100
        string responseUri,        // optional
        bytes32 responseHash,      // optional
        bytes32 tag                // optional
    ) external;
    
    // Read functions
    function getValidationStatus(bytes32 requestHash) 
        returns (address validatorAddress, uint256 agentId, uint8 response, bytes32 tag, uint256 lastUpdate);
    function getSummary(uint256 agentId, address[] validatorAddresses, bytes32 tag) 
        returns (uint64 count, uint8 avgResponse);
    function getAgentValidations(uint256 agentId) returns (bytes32[]);
    function getValidatorRequests(address validatorAddress) returns (bytes32[]);
}
```

**Key Features**:
- URI-based evidence (requestUri, responseUri)
- Optional tags for categorization
- Multiple responses per request (e.g., "soft finality", "hard finality")
- Filtering by validators and tags
- Composable with smart contracts

## Testing

Our comprehensive test suite includes **76 tests** with **100% pass rate**:

### Test Categories

| Category | Tests | Coverage |
|----------|-------|----------|
| **IdentityRegistry** | 22 | ERC-721, registration, metadata, authorization |
| **ReputationRegistry** | 25 | Signatures, feedback, revocation, filtering |
| **ValidationRegistry** | 29 | Requests, responses, multiple validators |

### Test Results

```bash
$ forge test --match-path "test/v1/*.t.sol"

Ran 3 test suites in 311.41ms (108.42ms CPU time): 76 tests passed, 0 failed, 0 skipped (76 total tests)

✅ IdentityRegistry: 22/22 tests passed
✅ ReputationRegistry: 25/25 tests passed
✅ ValidationRegistry: 29/29 tests passed
```

### Running Specific Tests

```bash
# Identity Registry tests
forge test --match-path test/v1/IdentityRegistry.t.sol -vv

# Reputation Registry tests (including signature verification)
forge test --match-path test/v1/ReputationRegistry.t.sol -vv

# Validation Registry tests
forge test --match-path test/v1/ValidationRegistry.t.sol -vv

# Run a specific test
forge test --match-test "test_GiveFeedback_Success" -vvv
```

## Security Features

### Signature Verification (Critical)
- ✅ **EIP-191 for EOAs** - Personal sign format: `"\x19Ethereum Signed Message:\n32" + hash`
- ✅ **ERC-1271 for Smart Contracts** - Fallback to `isValidSignatureNow()`
- ✅ **NOT EIP-712** - As specified in ERC-8004 v1.0 line 163

### Authorization
- **IdentityRegistry**: Owner/operator via ERC-721 mechanisms
- **ReputationRegistry**: Cryptographic signatures (EIP-191/ERC-1271)
- **ValidationRegistry**: Owner/operator for requests, validator for responses

### Replay Protection
- `chainId` verification
- `identityRegistry` address verification
- `expiry` timestamp check
- `indexLimit` prevents signature reuse

### Input Validation
- Score range checks (0-100)
- Address zero checks
- URI length validation
- Agent existence verification

## Gas Optimization

- ✅ **IR optimizer enabled** (`via_ir = true` in foundry.toml)
- ✅ **Efficient storage patterns** (packed structs, minimal storage)
- ✅ **Assembly for signature extraction** (gas savings)
- ✅ **Event-driven architecture** (off-chain data via URIs)

## Documentation

- **[v1.0 README](./src/v1/README.md)** - Detailed v1.0 documentation
- **[Implementation Status](./src/v1/IMPLEMENTATION_STATUS.md)** - Production readiness
- **[Spec Compliance Checklist](./src/v1/SPEC_COMPLIANCE_CHECKLIST.md)** - 80+ requirements verified
- **[Final Verification Report](./src/v1/FINAL_VERIFICATION_REPORT.md)** - Comprehensive verification
- **[ERC-8004 v1.0 Specification](./ERC-8004-v1.md)** - Full spec

## Deployment Networks

**Note**: The v1.0 contracts are new and not yet deployed. Use the deployment scripts above to deploy to your desired network.

For legacy v0.4 deployments, see the git history.

## Contributing

This reference implementation is maintained by the ERC-8004 working group. Contributions are welcome!

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add comprehensive tests
5. Ensure all tests pass: `forge test --match-path "test/v1/*.t.sol"` (76 tests should pass)
6. Submit a pull request

### Code Standards

- Follow Solidity style guide
- Include NatSpec documentation
- Add tests for new functionality
- Maintain gas efficiency
- Ensure spec compliance

## License

This project is licensed under CC0-1.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- The ERC-8004 working group for specification development
- The [A2A Protocol](https://a2a-protocol.org/) team for the foundational work
- OpenZeppelin for security patterns and best practices
- The Ethereum community for feedback and support

## 🔗 Links

- **Repository**: [github.com/ChaosChain/trustless-agents-erc-ri](https://github.com/ChaosChain/trustless-agents-erc-ri)
- **ERC Specification**: [ERC-8004 Trustless Agents v1.0](https://eips.ethereum.org/EIPS/eip-8004)
- **A2A Protocol**: [a2a-protocol.org](https://a2a-protocol.org/)

---

**Built with ❤️ by ChaosChain for the open AI agentic economy**
