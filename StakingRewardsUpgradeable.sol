// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title StakingRewardsUpgradeable
 * @notice Upgradeable version of Staking Rewards with token transfer functionality
 * This contract adds an admin function to transfer tokens held by the contract
 */
contract StakingRewardsUpgradeable {
    address public owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event TokenTransferred(address indexed token, address indexed to, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @notice Transfer tokens held by this contract to a recipient
     * @param token The token contract address (zHYPE token address)
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function transferToken(address token, address to, uint256 amount) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance >= amount, "Insufficient balance");
        
        require(tokenContract.transfer(to, amount), "Transfer failed");
        emit TokenTransferred(token, to, amount);
    }
    
    /**
     * @notice Transfer all tokens of a specific type held by this contract
     * @param token The token contract address
     * @param to The recipient address
     */
    function transferAllTokens(address token, address to) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(to != address(0), "Invalid recipient address");
        
        IERC20 tokenContract = IERC20(token);
        uint256 balance = tokenContract.balanceOf(address(this));
        require(balance > 0, "No tokens to transfer");
        
        require(tokenContract.transfer(to, balance), "Transfer failed");
        emit TokenTransferred(token, to, balance);
    }
    
    /**
     * @notice Transfer ownership of the contract
     * @param newOwner The new owner address
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
    
    /**
     * @notice Emergency function to transfer native currency (HYPE)
     * @param to The recipient address
     * @param amount The amount to transfer
     */
    function emergencyWithdraw(address payable to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient address");
        require(address(this).balance >= amount, "Insufficient balance");
        to.transfer(amount);
    }
}

