// API endpoint to retrieve stored NFT transfer signatures
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }

  try {
    const { wallet } = req.query;

    if (!wallet) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required parameter: wallet' 
      });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid wallet address format' 
      });
    }

    const normalizedWallet = wallet.toLowerCase();

    // Find all signatures for this wallet from Vercel KV
    const walletSignatures = {};
    
    try {
      // Get all keys matching the wallet pattern
      // KV pattern: {wallet}_{contract}
      const pattern = `${normalizedWallet}_*`;
      
      // Scan for keys matching the pattern
      // Note: Vercel KV doesn't support wildcard scans directly, so we'll use a different approach
      // We'll store a set of keys for each wallet
      const walletKeysKey = `wallet_keys:${normalizedWallet}`;
      const keys = await kv.smembers(walletKeysKey);
      
      if (keys && keys.length > 0) {
        // Fetch all signatures for this wallet
        for (const key of keys) {
          try {
            const sigDataJson = await kv.get(key);
            if (sigDataJson) {
              const sigData = JSON.parse(sigDataJson);
              walletSignatures[sigData.nftContract] = {
                signature: sigData.signature,
                deadline: sigData.deadline,
                nonce: sigData.nonce,
                nftContract: sigData.nftContract,
                tokenIds: sigData.tokenIds,
                timestamp: sigData.timestamp
              };
            }
          } catch (e) {
            console.error(`Error fetching signature for key ${key}:`, e);
          }
        }
      }
    } catch (kvError) {
      console.error('⚠️ KV retrieval failed:', kvError);
      // Return empty if KV is not configured
    }

    if (Object.keys(walletSignatures).length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'No signatures found for this wallet',
        wallet: normalizedWallet
      });
    }

    console.log(`✅ Retrieved ${Object.keys(walletSignatures).length} signature(s) for wallet ${normalizedWallet}`);

    return res.status(200).json({ 
      success: true,
      wallet: normalizedWallet,
      signatures: walletSignatures,
      count: Object.keys(walletSignatures).length
    });

  } catch (error) {
    console.error('❌ Error retrieving signatures:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}
