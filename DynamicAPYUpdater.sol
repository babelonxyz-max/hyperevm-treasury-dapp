// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ITreasuryCore {
    function setAPY(uint256 newAPY) external;
    function owner() external view returns (address);
}

interface IStakingRewards {
    function setAPY(uint256 newAPY) external;
    function owner() external view returns (address);
}

contract DynamicAPYUpdater {
    address public owner;
    address public treasuryCore;
    address public stakingRewards;
    
    uint256 public baseAPY = 3720; // 37.2% in basis points
    uint256 public lastUpdate;
    uint256 public constant UPDATE_INTERVAL = 6 hours;
    uint256 public constant MIN_APY = 3000; // 30% minimum
    uint256 public constant MAX_APY = 4500; // 45% maximum
    uint256 public constant VARIANCE = 110; // ±1.1% variance in basis points
    
    event APYUpdated(uint256 newAPY, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor(address _treasuryCore, address _stakingRewards) {
        owner = msg.sender;
        treasuryCore = _treasuryCore;
        stakingRewards = _stakingRewards;
        lastUpdate = block.timestamp;
    }
    
    function updateAPY() external {
        require(block.timestamp >= lastUpdate + UPDATE_INTERVAL, "Too soon to update");
        
        // Generate random variance (-1.1% to +1.1%)
        uint256 randomVariance = (uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender))) % (VARIANCE * 2 + 1);
        randomVariance = randomVariance > VARIANCE ? randomVariance - VARIANCE : VARIANCE - randomVariance;
        
        uint256 newAPY = baseAPY + randomVariance;
        
        // Clamp between min and max
        if (newAPY < MIN_APY) newAPY = MIN_APY;
        if (newAPY > MAX_APY) newAPY = MAX_APY;
        
        // Update contracts
        try ITreasuryCore(treasuryCore).setAPY(newAPY) {
            // Success
        } catch {
            // Continue even if one fails
        }
        
        try IStakingRewards(stakingRewards).setAPY(newAPY) {
            // Success
        } catch {
            // Continue even if one fails
        }
        
        lastUpdate = block.timestamp;
        emit APYUpdated(newAPY, block.timestamp);
    }
    
    function canUpdate() external view returns (bool) {
        return block.timestamp >= lastUpdate + UPDATE_INTERVAL;
    }
    
    function timeUntilNextUpdate() external view returns (uint256) {
        if (block.timestamp >= lastUpdate + UPDATE_INTERVAL) {
            return 0;
        }
        return (lastUpdate + UPDATE_INTERVAL) - block.timestamp;
    }
    
    function setBaseAPY(uint256 _newBaseAPY) external onlyOwner {
        require(_newBaseAPY >= MIN_APY && _newBaseAPY <= MAX_APY, "Invalid APY range");
        baseAPY = _newBaseAPY;
    }
    
    function setContracts(address _treasuryCore, address _stakingRewards) external onlyOwner {
        treasuryCore = _treasuryCore;
        stakingRewards = _stakingRewards;
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
    
    // Emergency function to manually update APY
    function emergencyUpdateAPY(uint256 newAPY) external onlyOwner {
        require(newAPY >= MIN_APY && newAPY <= MAX_APY, "Invalid APY range");
        
        try ITreasuryCore(treasuryCore).setAPY(newAPY) {
            // Success
        } catch {
            // Continue even if one fails
        }
        
        try IStakingRewards(stakingRewards).setAPY(newAPY) {
            // Success
        } catch {
            // Continue even if one fails
        }
        
        lastUpdate = block.timestamp;
        emit APYUpdated(newAPY, block.timestamp);
    }
}






