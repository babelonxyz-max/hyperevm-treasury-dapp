// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title StakingRewardsUpgradeableV2
 * @notice Upgradeable version of Staking Rewards with token transfer functionality
 * This contract adds transferToken function to allow moving zHYPE from the contract
 */
contract StakingRewardsUpgradeableV2 is 
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable
{
    event TokenTransferred(address indexed token, address indexed to, uint256 amount);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the upgradeable contract
     * @param owner_ Contract owner
     */
    function initialize(address owner_) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        
        if (owner_ != address(0)) {
            _transferOwnership(owner_);
        }
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
     * @notice Authorize upgrade (required by UUPS)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Existing Staking Rewards functions would be preserved here
    // This is a minimal upgrade to add transferToken
}
