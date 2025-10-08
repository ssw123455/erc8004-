# ERC-8004 v1.0 Reference Implementation

This directory contains the reference implementation of **ERC-8004: Trustless Agents** v1.0 specification.

## Overview

ERC-8004 provides a complete trust layer for agent-to-agent interactions through three on-chain registries:

1. **IdentityRegistry** - ERC-721 based agent registration
2. **ReputationRegistry** - On-chain feedback system with cryptographic authorization
3. **ValidationRegistry** - Generic validation hooks for independent verification

## 🏗️ Architecture

### IdentityRegistry

**Based on**: ERC-721 with URIStorage extension

**Key Features**:
- Each agent is an NFT (transferable ownership)
- `tokenURI` points to agent registration JSON file
- On-chain metadata storage with key-value pairs
- Compatible with all ERC-721 applications

**Core Functions**:
```solidity
// Registration (3 variants)
function register(string tokenURI, MetadataEntry[] metadata) returns (uint256 agentId)
function register(string tokenURI) returns (uint256 agentId)
function register() returns (uint256 agentId)

// Metadata management
function setMetadata(uint256 agentId, string key, bytes value)
function getMetadata(uint256 agentId, string key) returns (bytes value)
```

**Events**:
- `Registered(uint256 agentId, string tokenURI, address owner)`
- `MetadataSet(uint256 agentId, string key, bytes value)`

### ReputationRegistry

**Purpose**: On-chain feedback system with cryptographic authorization

**Key Features**:
- **EIP-191/ERC-1271** signature verification (as per ERC-8004 v1.0 spec)
- On-chain feedback storage (scores 0-100)
- Tag-based categorization (tag1, tag2)
- IPFS/URI support with integrity hashes
- Feedback revocation
- Response appending by any party
- On-chain aggregation for smart contract composability

**Core Functions**:
```solidity
// Feedback management
function giveFeedback(
    uint256 agentId,
    uint8 score,
    bytes32 tag1,
    bytes32 tag2,
    string fileuri,
    bytes32 filehash,
    bytes feedbackAuth
)

function revokeFeedback(uint256 agentId, uint64 feedbackIndex)

function appendResponse(
    uint256 agentId,
    address clientAddress,
    uint64 feedbackIndex,
    string responseUri,
    bytes32 responseHash
)

// Read functions
function getSummary(
    uint256 agentId,
    address[] clientAddresses,
    bytes32 tag1,
    bytes32 tag2
) returns (uint64 count, uint8 averageScore)

function readFeedback(
    uint256 agentId,
    address clientAddress,
    uint64 index
) returns (uint8 score, bytes32 tag1, bytes32 tag2, bool isRevoked)

function readAllFeedback(...) returns (...)
function getClients(uint256 agentId) returns (address[])
function getLastIndex(uint256 agentId, address clientAddress) returns (uint64)
```

**Authorization Flow**:
1. Server agent accepts task
2. Server agent signs `FeedbackAuth` struct
3. Client calls `giveFeedback()` with signed authorization
4. Contract verifies signature and stores feedback on-chain

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

### ValidationRegistry

**Purpose**: Generic hooks for requesting and recording independent validation

**Key Features**:
- Validation requests with URI and hash commitments
- Multiple responses per request (progressive validation)
- Tag-based categorization
- On-chain aggregation
- Supports various validation methods (stake-secured, zkML, TEE)

**Core Functions**:
```solidity
// Validation flow
function validationRequest(
    address validatorAddress,
    uint256 agentId,
    string requestUri,
    bytes32 requestHash
)

function validationResponse(
    bytes32 requestHash,
    uint8 response,
    string responseUri,
    bytes32 responseHash,
    bytes32 tag
)

// Read functions
function getValidationStatus(bytes32 requestHash) returns (...)
function getSummary(uint256 agentId, address[] validators, bytes32 tag) returns (...)
function getAgentValidations(uint256 agentId) returns (bytes32[])
function getValidatorRequests(address validator) returns (bytes32[])
```

## 📝 Registration File Format

The `tokenURI` in IdentityRegistry must resolve to a JSON file with this structure:

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Agent Name",
  "description": "Agent description",
  "image": "https://example.com/image.png",
  "endpoints": [
    {
      "name": "A2A",
      "endpoint": "https://agent.example/.well-known/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "MCP",
      "endpoint": "https://mcp.agent.eth/",
      "version": "2025-06-18"
    },
    {
      "name": "agentWallet",
      "endpoint": "eip155:1:0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7"
    }
  ],
  "registrations": [
    {
      "agentId": 22,
      "agentRegistry": "eip155:1:{identityRegistry}"
    }
  ],
  "supportedTrust": [
    "reputation",
    "crypto-economic",
    "tee-attestation"
  ]
}
```

## 🔒 Security Considerations

### IdentityRegistry
- ERC-721 standard security guarantees
- Ownership transfer requires approval
- Metadata can only be set by owner/operator

### ReputationRegistry
- Cryptographic authorization prevents unauthorized feedback
- Signature verification (EIP-191/ERC-1271)
- Sybil attack mitigation through client filtering
- On-chain audit trail (feedback cannot be deleted, only revoked)

### ValidationRegistry
- Only designated validator can respond
- Multiple responses enable progressive validation states
- Request-response matching via cryptographic hashes

## 🧪 Testing

Run the comprehensive test suite:

```bash
forge test
```

Run with gas reporting:

```bash
forge test --gas-report
```

Run specific test file:

```bash
forge test --match-path test/v1/IdentityRegistry.t.sol
```

## 📦 Deployment

Deploy to testnet:

```bash
forge script script/DeployV1.s.sol:DeployV1 --rpc-url sepolia --broadcast --verify
```

## 🎯 Use Cases

### 1. Agent Discovery
- Browse all agents via ERC-721 marketplaces
- Query registration files for capabilities
- Filter by trust models and endpoints

### 2. Reputation Systems
- On-chain feedback aggregation
- Off-chain sophisticated scoring algorithms
- Client reputation tracking
- Insurance pools based on agent scores

### 3. Validation Services
- Stake-secured inference validation
- zkML proof verification
- TEE attestation verification
- Progressive validation states (soft/hard finality)

## 🔗 Integration Examples

### Registering an Agent

```solidity
// Prepare metadata
IdentityRegistry.MetadataEntry[] memory metadata = new IdentityRegistry.MetadataEntry[](1);
metadata[0] = IdentityRegistry.MetadataEntry({
    key: "agentName",
    value: abi.encodePacked("MyAgent")
});

// Register
uint256 agentId = identityRegistry.register(
    "ipfs://QmXYZ.../registration.json",
    metadata
);
```

### Giving Feedback

```solidity
// Agent signs authorization
FeedbackAuth memory auth = FeedbackAuth({
    agentId: 123,
    clientAddress: msg.sender,
    indexLimit: 1,
    expiry: block.timestamp + 1 days,
    chainId: block.chainid,
    identityRegistry: address(identityRegistry),
    signerAddress: agentOwner
});

bytes memory signature = signFeedbackAuth(auth);

// Client gives feedback
reputationRegistry.giveFeedback(
    123,                    // agentId
    95,                     // score (0-100)
    "quality",              // tag1
    "speed",                // tag2
    "ipfs://QmABC...",      // fileuri
    keccak256(...),         // filehash
    signature               // feedbackAuth
);
```

### Requesting Validation

```solidity
// Request validation
validationRegistry.validationRequest(
    validatorAddress,
    agentId,
    "ipfs://QmDEF.../validation-request.json",
    keccak256(...)
);

// Validator responds
validationRegistry.validationResponse(
    requestHash,
    100,                    // response (0-100)
    "ipfs://QmGHI.../validation-response.json",
    keccak256(...),
    "hard-finality"         // tag
);
```

## 📚 Additional Resources

- [ERC-8004 Specification](../../ERC-8004-v1.md)
- [Implementation Notes](../../IMPLEMENTATION_NOTES.md)
- [A2A Protocol](https://a2a.dev)
- [MCP Protocol](https://modelcontextprotocol.io)

## 📄 License

CC0-1.0 - Public Domain Dedication

