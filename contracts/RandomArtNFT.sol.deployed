// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title RandomArtNFT
 * @notice Simple NFT contract with random art generation
 * @dev Generates random token URIs for each minted NFT
 */
contract RandomArtNFT is ERC721, ERC721Enumerable, Ownable {
    using Strings for uint256;
    
    uint256 private _nextTokenId;
    string private _baseTokenURI;
    uint256 public maxSupply;
    bool public paused;
    
    // Random seed for art generation
    uint256 private _seed;
    
    event NFTMinted(address indexed to, uint256 indexed tokenId);
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 _maxSupply,
        address initialOwner
    ) ERC721(name, symbol) Ownable(initialOwner) {
        _baseTokenURI = baseURI;
        maxSupply = _maxSupply;
        _nextTokenId = 1;
        paused = false;
        _seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
    }
    
    /**
     * @notice Mint a single NFT to an address
     * @param to Address to mint to
     */
    function mint(address to) external onlyOwner {
        require(!paused, "Minting is paused");
        require(_nextTokenId <= maxSupply, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        
        // Update seed for next random generation
        _seed = uint256(keccak256(abi.encodePacked(_seed, tokenId, block.timestamp)));
        
        emit NFTMinted(to, tokenId);
    }
    
    /**
     * @notice Mint multiple NFTs to an address
     * @param to Address to mint to
     * @param quantity Number of NFTs to mint
     */
    function mintBatch(address to, uint256 quantity) external onlyOwner {
        require(!paused, "Minting is paused");
        require(_nextTokenId + quantity - 1 <= maxSupply, "Exceeds max supply");
        require(to != address(0), "Cannot mint to zero address");
        require(quantity > 0, "Quantity must be greater than 0");
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = _nextTokenId;
            _nextTokenId++;
            
            _safeMint(to, tokenId);
            
            // Update seed for next random generation
            _seed = uint256(keccak256(abi.encodePacked(_seed, tokenId, block.timestamp)));
            
            emit NFTMinted(to, tokenId);
        }
    }
    
    /**
     * @notice Generate random token URI based on token ID and seed
     * @param tokenId Token ID
     * @return Token URI string
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        // Generate random attributes based on token ID and seed
        uint256 random = uint256(keccak256(abi.encodePacked(_seed, tokenId, block.timestamp)));
        
        // Extract random values for art generation
        uint256 color1 = random % 256;
        uint256 color2 = (random >> 8) % 256;
        uint256 color3 = (random >> 16) % 256;
        uint256 pattern = (random >> 24) % 10;
        uint256 shape = (random >> 32) % 8;
        
        // Create SVG art on-chain
        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">',
            '<rect width="400" height="400" fill="rgb(', 
            uint256(color1).toString(), ',', 
            uint256(color2).toString(), ',', 
            uint256(color3).toString(), ')"/>',
            _generatePattern(pattern, shape, random),
            '<text x="200" y="200" font-family="Arial" font-size="24" fill="white" text-anchor="middle">',
            '#', tokenId.toString(),
            '</text>',
            '</svg>'
        ));
        
        // Encode SVG as data URI
        string memory encodedSVG = _base64Encode(bytes(svg));
        return string(abi.encodePacked('data:image/svg+xml;base64,', encodedSVG));
    }
    
    /**
     * @notice Generate random pattern for SVG
     */
    function _generatePattern(uint256 patternType, uint256 shapeType, uint256 random) internal pure returns (string memory) {
        if (patternType < 3) {
            // Circles
            uint256 x = 50 + (random % 300);
            uint256 y = 50 + ((random >> 8) % 300);
            uint256 r = 20 + ((random >> 16) % 80);
            return string(abi.encodePacked(
                '<circle cx="', uint256(x).toString(), '" cy="', uint256(y).toString(), 
                '" r="', uint256(r).toString(), '" fill="rgba(255,255,255,0.3)"/>'
            ));
        } else if (patternType < 6) {
            // Rectangles
            uint256 x = 50 + (random % 250);
            uint256 y = 50 + ((random >> 8) % 250);
            uint256 w = 50 + ((random >> 16) % 100);
            uint256 h = 50 + ((random >> 24) % 100);
            return string(abi.encodePacked(
                '<rect x="', uint256(x).toString(), '" y="', uint256(y).toString(),
                '" width="', uint256(w).toString(), '" height="', uint256(h).toString(), 
                '" fill="rgba(255,255,255,0.2)"/>'
            ));
        } else {
            // Lines
            uint256 x1 = random % 400;
            uint256 y1 = (random >> 8) % 400;
            uint256 x2 = (random >> 16) % 400;
            uint256 y2 = (random >> 24) % 400;
            return string(abi.encodePacked(
                '<line x1="', uint256(x1).toString(), '" y1="', uint256(y1).toString(),
                '" x2="', uint256(x2).toString(), '" y2="', uint256(y2).toString(),
                '" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>'
            ));
        }
    }
    
    /**
     * @notice Base64 encode function
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 encodedLen = 4 * ((data.length + 2) / 3);
        
        bytes memory result = new bytes(encodedLen);
        uint256 i = 0;
        uint256 j = 0;
        
        for (; i + 3 <= data.length; i += 3) {
            uint256 a = uint256(uint8(data[i]));
            uint256 b = uint256(uint8(data[i + 1]));
            uint256 c = uint256(uint8(data[i + 2]));
            
            uint256 bitmap = (a << 16) | (b << 8) | c;
            
            result[j++] = bytes(table)[bitmap >> 18];
            result[j++] = bytes(table)[(bitmap >> 12) & 63];
            result[j++] = bytes(table)[(bitmap >> 6) & 63];
            result[j++] = bytes(table)[bitmap & 63];
        }
        
        if (i < data.length) {
            uint256 a = uint256(uint8(data[i]));
            uint256 bitmap = a << 16;
            
            if (i + 1 < data.length) {
                uint256 b = uint256(uint8(data[i + 1]));
                bitmap |= b << 8;
                result[j++] = bytes(table)[bitmap >> 18];
                result[j++] = bytes(table)[(bitmap >> 12) & 63];
                result[j++] = bytes(table)[(bitmap >> 6) & 63];
                result[j++] = 0x3D; // '='
            } else {
                result[j++] = bytes(table)[bitmap >> 18];
                result[j++] = bytes(table)[(bitmap >> 12) & 63];
                result[j++] = 0x3D; // '='
                result[j++] = 0x3D; // '='
            }
        }
        
        return string(result);
    }
    
    /**
     * @notice Set base token URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @notice Pause/unpause minting
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }
    
    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
