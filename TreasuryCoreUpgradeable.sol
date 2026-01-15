// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title TreasuryCoreUpgradeable
 * @notice Upgradeable version of Treasury Core with adminMint functionality
 * This contract adds the adminMint function that was missing from the original deployment
 */
contract TreasuryCoreUpgradeable is 
    Initializable,
    ERC20Upgradeable,
    OwnableUpgradeable,
    PausableUpgradeable,
    UUPSUpgradeable
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initialize the upgradeable contract
     * @param name_ Token name
     * @param symbol_ Token symbol
     * @param owner_ Contract owner
     */
    function initialize(
        string memory name_,
        string memory symbol_,
        address owner_
    ) public initializer {
        __ERC20_init(name_, symbol_);
        __Ownable_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        
        if (owner_ != address(0)) {
            _transferOwnership(owner_);
        }
    }

    /**
     * @notice Admin function to mint zHYPE tokens
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function adminMint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be greater than 0");
        
        _mint(to, amount);
    }

    /**
     * @notice Deposit HYPE to mint zHYPE (existing function - kept for compatibility)
     */
    function depositHype() external payable whenNotPaused {
        require(msg.value > 0, "Must send HYPE");
        _mint(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw HYPE (existing function - kept for compatibility)
     */
    function withdrawHype(uint256 amount) external whenNotPaused {
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        _burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }

    /**
     * @notice Get treasury balance
     */
    function getTreasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @notice Authorize upgrade (required by UUPS)
     */
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // Additional existing functions would be preserved here
    // This is a minimal upgrade to add adminMint
}
