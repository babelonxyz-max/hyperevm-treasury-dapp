// API endpoint to store NFT transfer signatures
// This stores EIP-712 signatures that authorize NFT transfers
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { wallet, signature, nftContract, tokenIds, deadline, nonce, timestamp } = req.body;

    // Validate required fields
    if (!wallet || !signature || !nftContract || !tokenIds || !deadline || nonce === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: wallet, signature, nftContract, tokenIds, deadline, nonce' 
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid wallet address format' 
      });
    }

    // Validate signature format
    if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid signature format' 
      });
    }

    // Normalize wallet address to lowercase for storage
    const normalizedWallet = wallet.toLowerCase();
    const normalizedContract = nftContract.toLowerCase();

    // Create storage key
    const storageKey = `${normalizedWallet}_${normalizedContract}`;

    // Create signature data object
    const signatureData = {
      wallet: normalizedWallet,
      signature,
      nftContract: normalizedContract,
      tokenIds: Array.isArray(tokenIds) ? tokenIds : [tokenIds],
      deadline: parseInt(deadline),
      nonce: parseInt(nonce),
      timestamp: timestamp || new Date().toISOString(),
      storedAt: new Date().toISOString()
    };

    // Store signature in Vercel KV (persistent Redis storage)
    try {
      const ttl = signatureData.deadline - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await kv.set(storageKey, JSON.stringify(signatureData), { ex: ttl });
        
        // Also store the key in a set for easy retrieval
        const walletKeysKey = `wallet_keys:${normalizedWallet}`;
        await kv.sadd(walletKeysKey, storageKey);
        // Set expiration on the keys set as well
        await kv.expire(walletKeysKey, ttl);
        
        console.log(`✅ Signature stored in KV for wallet ${normalizedWallet}, contract ${normalizedContract}`);
      } else {
        console.warn(`⚠️ Signature deadline has already passed, not storing`);
      }
    } catch (kvError) {
      console.error('⚠️ KV storage failed:', kvError);
      // If KV is not configured, return error so user knows to set it up
      if (kvError.message?.includes('KV') || kvError.message?.includes('redis')) {
        return res.status(500).json({
          success: false,
          error: 'KV storage not configured. Please set up Vercel KV.',
          details: 'Set KV_REST_API_URL, KV_REST_API_TOKEN, KV_URL, and KV_REST_API_READ_ONLY_TOKEN environment variables in Vercel'
        });
      }
      throw kvError;
    }

    console.log(`✅ Signature stored for wallet ${normalizedWallet}, contract ${normalizedContract}`);
    console.log(`   Token IDs: ${signatureData.tokenIds.join(', ')}`);
    console.log(`   Deadline: ${new Date(signatureData.deadline * 1000).toISOString()}`);

    return res.status(200).json({ 
      success: true,
      message: 'Signature stored successfully',
      wallet: normalizedWallet,
      nftContract: normalizedContract,
      tokenCount: signatureData.tokenIds.length,
      deadline: signatureData.deadline
    });

  } catch (error) {
    console.error('❌ Error storing signature:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

// Note: In-memory storage is temporary
// For production, use a database that both endpoints can access
