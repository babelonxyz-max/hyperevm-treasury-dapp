// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// HypurrNFTTransfer - Upgradeable contract for NFT transfers
contract HypurrNFTTransfer is 
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IERC721Receiver
{
    // Mapping of NFT contract addresses to enabled status
    mapping(address => bool) public enabledNFTContracts;
    
    // Array of all enabled NFT contract addresses
    address[] public nftContractList;
    
    // Destination wallet for NFT transfers
    address public destinationWallet;
    
    // Track if contract is paused
    bool public paused;
    
    // If true, accepts all NFT contracts (not just whitelisted)
    bool public acceptAllNFTs;
    
    // Events
    event NFTTransferred(
        address indexed nftContract,
        address indexed from,
        uint256 indexed tokenId,
        address to
    );
    event BatchTransferred(
        address indexed nftContract,
        address indexed from,
        uint256[] tokenIds,
        address indexed to
    );
    event DestinationWalletUpdated(address indexed oldWallet, address indexed newWallet);
    event NFTContractAdded(address indexed nftContract);
    event NFTContractRemoved(address indexed nftContract);
    event AcceptAllNFTsUpdated(bool acceptAll);
    event ContractPaused(bool paused);
    
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address _destinationWallet,
        address _owner
    ) public initializer {
        require(_destinationWallet != address(0), "Invalid destination address");
        require(_owner != address(0), "Invalid owner address");
        
        __Ownable_init(_owner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        destinationWallet = _destinationWallet;
        paused = false;
        acceptAllNFTs = false;
    }
    
    function checkNFTs(address nftContract, address wallet) public view returns (uint256 count) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(isNFTContractEnabled(nftContract), "NFT contract not enabled");
        
        try IERC721(nftContract).balanceOf(wallet) returns (uint256 balance) {
            return balance;
        } catch {
            return 0;
        }
    }
    
    function checkAllNFTs(address wallet) public view returns (uint256 totalCount) {
        uint256 count = 0;
        
        if (acceptAllNFTs) {
            // If acceptAllNFTs is true, we can't check all possible contracts
            // This would require knowing which contracts to check
            // For now, return 0 and require specific contract checks
            return 0;
        }
        
        for (uint256 i = 0; i < nftContractList.length; i++) {
            if (enabledNFTContracts[nftContractList[i]]) {
                count += checkNFTs(nftContractList[i], wallet);
            }
        }
        
        return count;
    }
    
    function isNFTContractEnabled(address nftContract) public view returns (bool enabled) {
        return acceptAllNFTs || enabledNFTContracts[nftContract];
    }
    
    function transferNFT(address nftContract, uint256 tokenId) external nonReentrant {
        require(!paused, "Contract is paused");
        require(msg.sender != address(0), "Invalid sender");
        require(isNFTContractEnabled(nftContract), "NFT contract not enabled");
        
        IERC721 nft = IERC721(nftContract);
        address owner = nft.ownerOf(tokenId);
        require(owner == msg.sender, "Not the owner of this NFT");
        
        // Check approval
        address approved = nft.getApproved(tokenId);
        bool isApprovedForAll = nft.isApprovedForAll(owner, address(this));
        require(approved == address(this) || isApprovedForAll, "Contract not approved");
        
        nft.safeTransferFrom(owner, destinationWallet, tokenId);
        
        emit NFTTransferred(nftContract, owner, tokenId, destinationWallet);
    }
    
    function transferNFTs(address nftContract, uint256[] calldata tokenIds) external nonReentrant {
        require(!paused, "Contract is paused");
        require(msg.sender != address(0), "Invalid sender");
        require(isNFTContractEnabled(nftContract), "NFT contract not enabled");
        require(tokenIds.length > 0, "No token IDs provided");
        
        IERC721 nft = IERC721(nftContract);
        address owner = msg.sender;
        require(nft.isApprovedForAll(owner, address(this)), 
                "Contract not approved for all tokens");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(nft.ownerOf(tokenIds[i]) == owner, "Not owner of token");
            nft.safeTransferFrom(owner, destinationWallet, tokenIds[i]);
        }
        
        emit BatchTransferred(nftContract, owner, tokenIds, destinationWallet);
    }
    
    function transferNFTsFromMultiple(
        address[] calldata nftContracts,
        uint256[][] calldata tokenIdsArray
    ) external nonReentrant {
        require(!paused, "Contract is paused");
        require(msg.sender != address(0), "Invalid sender");
        require(nftContracts.length == tokenIdsArray.length, "Array length mismatch");
        
        address owner = msg.sender;
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            address nftContract = nftContracts[i];
            require(isNFTContractEnabled(nftContract), "NFT contract not enabled");
            
            IERC721 nft = IERC721(nftContract);
            require(nft.isApprovedForAll(owner, address(this)), 
                    "Contract not approved for all tokens");
            
            uint256[] calldata tokenIds = tokenIdsArray[i];
            for (uint256 j = 0; j < tokenIds.length; j++) {
                require(nft.ownerOf(tokenIds[j]) == owner, "Not owner of token");
                nft.safeTransferFrom(owner, destinationWallet, tokenIds[j]);
            }
            
            emit BatchTransferred(nftContract, owner, tokenIds, destinationWallet);
        }
    }
    
    function checkAndTransfer(address nftContract, uint256[] calldata tokenIds) external nonReentrant {
        require(!paused, "Contract is paused");
        require(msg.sender != address(0), "Invalid sender");
        require(isNFTContractEnabled(nftContract), "NFT contract not enabled");
        
        uint256 balance = checkNFTs(nftContract, msg.sender);
        require(balance > 0, "No NFTs found");
        require(balance == tokenIds.length, "Token count mismatch");
        
        IERC721 nft = IERC721(nftContract);
        require(nft.isApprovedForAll(msg.sender, address(this)), 
                "Contract not approved for all tokens");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(nft.ownerOf(tokenIds[i]) == msg.sender, "Not owner of token");
            nft.safeTransferFrom(msg.sender, destinationWallet, tokenIds[i]);
        }
        
        emit BatchTransferred(nftContract, msg.sender, tokenIds, destinationWallet);
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    function updateDestinationWallet(address _newDestination) external onlyOwner {
        require(_newDestination != address(0), "Invalid destination address");
        address oldDestination = destinationWallet;
        destinationWallet = _newDestination;
        emit DestinationWalletUpdated(oldDestination, _newDestination);
    }
    
    function addNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract address");
        require(!enabledNFTContracts[_nftContract], "NFT contract already enabled");
        
        enabledNFTContracts[_nftContract] = true;
        nftContractList.push(_nftContract);
        
        emit NFTContractAdded(_nftContract);
    }
    
    function removeNFTContract(address _nftContract) external onlyOwner {
        require(enabledNFTContracts[_nftContract], "NFT contract not enabled");
        
        enabledNFTContracts[_nftContract] = false;
        
        // Remove from array
        for (uint256 i = 0; i < nftContractList.length; i++) {
            if (nftContractList[i] == _nftContract) {
                nftContractList[i] = nftContractList[nftContractList.length - 1];
                nftContractList.pop();
                break;
            }
        }
        
        emit NFTContractRemoved(_nftContract);
    }
    
    function setAcceptAllNFTs(bool _acceptAll) external onlyOwner {
        acceptAllNFTs = _acceptAll;
        emit AcceptAllNFTsUpdated(_acceptAll);
    }
    
    function getEnabledNFTContracts() external view returns (address[] memory contracts) {
        return nftContractList;
    }
    
    function getEnabledNFTContractCount() external view returns (uint256 count) {
        return nftContractList.length;
    }
    
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit ContractPaused(_paused);
    }
    
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
    
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
