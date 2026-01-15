# Hypurr NFT Logic - Implementation Plan

## 🎯 Current Status

✅ **Implemented:**
- Wallet connection
- Basic NFT count verification (`balanceOf()`)
- Terms signature acceptance
- Local storage for signatures

## 📋 Planned NFT Logic

### Phase 1: Enhanced Verification

#### 1.1 Token ID Retrieval
- **Goal:** Get specific token IDs owned by user
- **Implementation:**
  ```javascript
  // ERC-721 Enumerable functions
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
  "function tokenByIndex(uint256 index) external view returns (uint256)"
  ```
- **Use Case:** Display specific NFTs, verify ownership of specific tokens

#### 1.2 Metadata Retrieval
- **Goal:** Get NFT metadata (name, image, traits, etc.)
- **Implementation:**
  - Check for `tokenURI(uint256 tokenId)` function
  - Fetch metadata from IPFS/HTTP
  - Parse JSON metadata
- **Use Case:** Display NFT images, show traits, verify authenticity

#### 1.3 Delegation Check
- **Goal:** Check if NFTs are delegated
- **Implementation:**
  - Check for delegation contract/function
  - Verify delegation status per token
- **Use Case:** Show delegation status, prevent double-delegation

### Phase 2: Signature & Verification

#### 2.1 Enhanced Signature
- **Current:** Simple message signature
- **Enhanced:**
  - Include NFT token IDs in signature
  - Include timestamp and nonce
  - Include contract address
- **Format:**
  ```
  I accept Hypurr Terms of Service
  Wallet: 0x...
  NFTs: [123, 456, 789]
  Contract: 0x...
  Timestamp: 2026-01-XX
  ```

#### 2.2 Signature Verification
- **Backend Verification (Future):**
  - Verify signature on server
  - Check NFT ownership at signature time
  - Store verification status in database
- **Frontend Verification:**
  - Verify signature format
  - Check signature hasn't expired
  - Validate NFT ownership matches signature

### Phase 3: Delegation Logic

#### 3.1 Delegation Function
- **Goal:** Allow users to delegate NFTs
- **Implementation:**
  ```javascript
  // Check if contract has delegation
  "function delegate(uint256 tokenId, address delegate) external"
  "function getDelegation(uint256 tokenId) external view returns (address)"
  "function isDelegated(uint256 tokenId) external view returns (bool)"
  ```
- **Flow:**
  1. User connects wallet
  2. System verifies NFT ownership
  3. User selects NFTs to delegate
  4. User signs delegation transaction
  5. System tracks delegation status

#### 3.2 Delegation Status
- **Display:**
  - Which NFTs are delegated
  - To whom they're delegated
  - Delegation expiration (if applicable)
- **Storage:**
  - On-chain (preferred)
  - Or off-chain with on-chain verification

### Phase 4: Advanced Features

#### 4.1 Batch Operations
- **Batch Verification:** Verify multiple NFTs at once
- **Batch Delegation:** Delegate multiple NFTs in one transaction
- **Gas Optimization:** Use multicall for efficiency

#### 4.2 NFT Filtering
- **Filter by:**
  - Token ID ranges
  - Traits/attributes
  - Delegation status
  - Ownership duration

#### 4.3 History Tracking
- **Track:**
  - Signature history
  - Delegation history
  - Ownership changes
  - Verification events

## 🔧 Technical Implementation

### Contract Interface Needed

```solidity
interface IHypurrNFT {
    // Standard ERC-721
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function tokenURI(uint256 tokenId) external view returns (string);
    
    // Enumerable (if available)
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256);
    function totalSupply() external view returns (uint256);
    
    // Delegation (if implemented)
    function delegate(uint256 tokenId, address delegate) external;
    function getDelegation(uint256 tokenId) external view returns (address);
    function isDelegated(uint256 tokenId) external view returns (bool);
    function revokeDelegation(uint256 tokenId) external;
}
```

### Frontend Functions to Add

```javascript
// Get all token IDs owned by user
async function getUserTokenIds(address) {
  // Implementation
}

// Get NFT metadata
async function getNFTMetadata(tokenId) {
  // Implementation
}

// Check delegation status
async function checkDelegation(tokenId) {
  // Implementation
}

// Delegate NFT
async function delegateNFT(tokenId, delegateAddress) {
  // Implementation
}
```

## 📊 Data Flow

```
User Connects Wallet
    ↓
Verify NFT Ownership (balanceOf)
    ↓
Get Token IDs (tokenOfOwnerByIndex)
    ↓
Fetch Metadata (tokenURI)
    ↓
Display NFTs to User
    ↓
User Signs Terms (with NFT info)
    ↓
Store Signature (localStorage/backend)
    ↓
[Optional] Delegate NFTs
    ↓
Track Status
```

## 🎨 UI Components Needed

1. **NFT Gallery**
   - Display user's NFTs
   - Show metadata (image, name, traits)
   - Selection interface

2. **Delegation Panel**
   - Select NFTs to delegate
   - Enter delegate address
   - Confirm transaction

3. **Verification Status**
   - Show verification status
   - Display signature info
   - Show delegation status

4. **NFT Details Modal**
   - Full NFT information
   - Metadata display
   - Delegation history

## 🔐 Security Considerations

1. **Signature Validation:**
   - Verify signature on backend
   - Check NFT ownership at signature time
   - Prevent signature replay

2. **Delegation Security:**
   - Verify delegate address
   - Check delegation permissions
   - Prevent unauthorized delegation

3. **Contract Verification:**
   - Verify contract address
   - Check contract is legitimate
   - Validate contract functions exist

## 📝 Next Steps

1. **Get Contract Details:**
   - Contract address
   - ABI/interface
   - Available functions
   - Delegation implementation (if any)

2. **Implement Phase 1:**
   - Add token ID retrieval
   - Add metadata fetching
   - Display NFT gallery

3. **Implement Phase 2:**
   - Enhanced signature format
   - Signature verification

4. **Implement Phase 3:**
   - Delegation functions
   - Delegation UI

5. **Testing:**
   - Test with real NFTs
   - Test delegation flow
   - Test signature verification

## ❓ Questions to Answer

1. **Does Hypurr NFT contract have:**
   - Enumerable functions?
   - Delegation functions?
   - Metadata on-chain or off-chain?

2. **Delegation Requirements:**
   - What does "delegation" mean in this context?
   - Is it on-chain or off-chain?
   - Who can delegate?
   - Can delegation be revoked?

3. **Signature Requirements:**
   - What information must be in signature?
   - Should it include token IDs?
   - Should it be verified on backend?

4. **Use Cases:**
   - What is the main purpose of this page?
   - What actions should users be able to take?
   - What verification is needed?
