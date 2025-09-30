import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ContractTest = ({ account, provider, signer }) => {
  const [contractInfo, setContractInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testContract = async () => {
      if (!account || !provider || !signer) return;

      try {
        console.log("🧪 Testing contract connection...");
        
        // Load deployed addresses
        const response = await fetch('/deployed-addresses.json');
        const addresses = await response.json();
        console.log("📍 Loaded addresses:", addresses);

        // Create treasury contract
        const treasuryABI = [
          "function getZHypeTokenAddress() external view returns (address)",
          "function getTotalPendingUnstaking() external view returns (uint256)",
          "function getUnstakingDelay() external pure returns (uint256)"
        ];

        const treasuryContract = new ethers.Contract(
          addresses.treasury,
          treasuryABI,
          signer
        );

        console.log("🏦 Treasury contract created:", addresses.treasury);

        // Get zHYPE token address
        const zHypeTokenAddress = await treasuryContract.getZHypeTokenAddress();
        console.log("🪙 zHYPE token address:", zHypeTokenAddress);

        // Create zHYPE token contract
        const ERC20_ABI = [
          "function balanceOf(address owner) external view returns (uint256)",
          "function totalSupply() external view returns (uint256)",
          "function decimals() external view returns (uint8)",
          "function symbol() external view returns (string)",
          "function name() external view returns (string)"
        ];

        const zHypeTokenContract = new ethers.Contract(
          zHypeTokenAddress,
          ERC20_ABI,
          provider
        );

        // Get balances
        const zHypeBalance = await zHypeTokenContract.balanceOf(account);
        const totalSupply = await zHypeTokenContract.totalSupply();
        const symbol = await zHypeTokenContract.symbol();
        const name = await zHypeTokenContract.name();

        console.log("🪙 zHYPE balance:", ethers.formatEther(zHypeBalance));
        console.log("📊 Total supply:", ethers.formatEther(totalSupply));
        console.log("🏷️ Symbol:", symbol);
        console.log("📝 Name:", name);

        setContractInfo({
          treasuryAddress: addresses.treasury,
          zHypeTokenAddress: zHypeTokenAddress,
          zHypeBalance: ethers.formatEther(zHypeBalance),
          totalSupply: ethers.formatEther(totalSupply),
          symbol: symbol,
          name: name
        });

      } catch (err) {
        console.error("❌ Contract test failed:", err);
        setError(err.message);
      }
    };

    testContract();
  }, [account, provider, signer]);

  if (!account) {
    return <div>Please connect your wallet</div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Contract Test Results</h3>
      {error && <div style={{ color: 'red' }}>Error: {error}</div>}
      {contractInfo && (
        <div>
          <p><strong>Treasury Address:</strong> {contractInfo.treasuryAddress}</p>
          <p><strong>zHYPE Token Address:</strong> {contractInfo.zHypeTokenAddress}</p>
          <p><strong>Your zHYPE Balance:</strong> {contractInfo.zHypeBalance} {contractInfo.symbol}</p>
          <p><strong>Total Supply:</strong> {contractInfo.totalSupply} {contractInfo.symbol}</p>
          <p><strong>Token Name:</strong> {contractInfo.name}</p>
        </div>
      )}
    </div>
  );
};

export default ContractTest;
