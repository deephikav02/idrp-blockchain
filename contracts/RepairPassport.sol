// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RepairPassport
 * @dev Blockchain-based Digital Repair Passport for product lifecycle tracking
 * @author IDRP — India Digital Repair Passport
 */
contract RepairPassport {
    
    // ═══════════════════════════════════════════
    // ENUMS & STRUCTS
    // ═══════════════════════════════════════════
    
    enum Role { None, Manufacturer, RepairCenter, Consumer }
    enum RepairStatus { Pending, Verified, SelfReported }
    
    struct Product {
        string productId;
        string brand;
        string city;
        address owner;
        address manufacturer;
        uint256 registeredAt;
        bool exists;
        uint256 repairCount;
        uint256 transferCount;
    }
    
    struct RepairRecord {
        string productId;
        address repairer;
        string repairCenter;
        string partReplaced;
        string description;
        string ipfsHash;
        uint256 timestamp;
        RepairStatus status;
        bool customerReported;
    }
    
    struct TransferRecord {
        string productId;
        address fromOwner;
        address toOwner;
        uint256 timestamp;
    }
    
    // ═══════════════════════════════════════════
    // STATE VARIABLES
    // ═══════════════════════════════════════════
    
    address public admin;
    
    mapping(string => Product) public products;
    mapping(string => RepairRecord[]) public repairs;
    mapping(string => TransferRecord[]) public transfers;
    mapping(address => Role) public roles;
    mapping(address => string) public userNames;
    
    string[] public productIds;
    
    uint256 public totalProducts;
    uint256 public totalRepairs;
    uint256 public totalTransfers;
    
    // ═══════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════
    
    event ProductRegistered(
        string indexed productId,
        string brand,
        string city,
        address indexed owner,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event RepairLogged(
        string indexed productId,
        address indexed repairer,
        string repairCenter,
        string partReplaced,
        string ipfsHash,
        uint256 timestamp,
        bool customerReported,
        uint256 blockNumber
    );
    
    event OwnershipTransferred(
        string indexed productId,
        address indexed fromOwner,
        address indexed toOwner,
        uint256 timestamp,
        uint256 blockNumber
    );
    
    event RoleAssigned(address indexed user, Role role);
    
    // ═══════════════════════════════════════════
    // MODIFIERS
    // ═══════════════════════════════════════════
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyManufacturer() {
        require(
            roles[msg.sender] == Role.Manufacturer || msg.sender == admin,
            "Only manufacturers can register products"
        );
        _;
    }
    
    modifier onlyRepairCenter() {
        require(
            roles[msg.sender] == Role.RepairCenter || msg.sender == admin,
            "Only authorized repair centers can log repairs"
        );
        _;
    }
    
    modifier productExists(string memory _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }
    
    // ═══════════════════════════════════════════
    // CONSTRUCTOR
    // ═══════════════════════════════════════════
    
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Manufacturer;
    }
    
    // ═══════════════════════════════════════════
    // ROLE MANAGEMENT
    // ═══════════════════════════════════════════
    
    function assignRole(address _user, Role _role, string memory _name) external onlyAdmin {
        roles[_user] = _role;
        userNames[_user] = _name;
        emit RoleAssigned(_user, _role);
    }
    
    // ═══════════════════════════════════════════
    // PRODUCT REGISTRATION
    // ═══════════════════════════════════════════
    
    function registerProduct(
        string memory _productId,
        string memory _brand,
        string memory _city,
        string memory _ownerName
    ) external onlyManufacturer {
        require(!products[_productId].exists, "Product already registered");
        
        products[_productId] = Product({
            productId: _productId,
            brand: _brand,
            city: _city,
            owner: msg.sender,
            manufacturer: msg.sender,
            registeredAt: block.timestamp,
            exists: true,
            repairCount: 0,
            transferCount: 0
        });
        
        userNames[msg.sender] = _ownerName;
        productIds.push(_productId);
        totalProducts++;
        
        emit ProductRegistered(
            _productId,
            _brand,
            _city,
            msg.sender,
            block.timestamp,
            block.number
        );
    }
    
    // ═══════════════════════════════════════════
    // REPAIR LOGGING
    // ═══════════════════════════════════════════
    
    function logRepair(
        string memory _productId,
        string memory _repairCenter,
        string memory _partReplaced,
        string memory _description,
        string memory _ipfsHash
    ) external productExists(_productId) {
        RepairStatus status;
        bool isCustomerReported;
        
        if (roles[msg.sender] == Role.RepairCenter || msg.sender == admin) {
            status = RepairStatus.Verified;
            isCustomerReported = false;
        } else {
            // Customer self-reporting
            require(
                products[_productId].owner == msg.sender,
                "Only product owner can self-report repairs"
            );
            status = RepairStatus.SelfReported;
            isCustomerReported = true;
        }
        
        repairs[_productId].push(RepairRecord({
            productId: _productId,
            repairer: msg.sender,
            repairCenter: _repairCenter,
            partReplaced: _partReplaced,
            description: _description,
            ipfsHash: _ipfsHash,
            timestamp: block.timestamp,
            status: status,
            customerReported: isCustomerReported
        }));
        
        products[_productId].repairCount++;
        totalRepairs++;
        
        emit RepairLogged(
            _productId,
            msg.sender,
            _repairCenter,
            _partReplaced,
            _ipfsHash,
            block.timestamp,
            isCustomerReported,
            block.number
        );
    }
    
    // Verify a self-reported repair (only repair centers)
    function verifyRepair(
        string memory _productId,
        uint256 _repairIndex
    ) external productExists(_productId) onlyRepairCenter {
        require(_repairIndex < repairs[_productId].length, "Invalid repair index");
        require(
            repairs[_productId][_repairIndex].status == RepairStatus.SelfReported,
            "Repair is not self-reported"
        );
        repairs[_productId][_repairIndex].status = RepairStatus.Verified;
    }
    
    // ═══════════════════════════════════════════
    // OWNERSHIP TRANSFER
    // ═══════════════════════════════════════════
    
    function transferOwnership(
        string memory _productId,
        address _newOwner
    ) external productExists(_productId) {
        require(
            products[_productId].owner == msg.sender || msg.sender == admin,
            "Only current owner can transfer"
        );
        require(_newOwner != address(0), "Invalid new owner address");
        
        address previousOwner = products[_productId].owner;
        
        transfers[_productId].push(TransferRecord({
            productId: _productId,
            fromOwner: previousOwner,
            toOwner: _newOwner,
            timestamp: block.timestamp
        }));
        
        products[_productId].owner = _newOwner;
        products[_productId].transferCount++;
        totalTransfers++;
        
        emit OwnershipTransferred(
            _productId,
            previousOwner,
            _newOwner,
            block.timestamp,
            block.number
        );
    }
    
    // ═══════════════════════════════════════════
    // VIEW FUNCTIONS
    // ═══════════════════════════════════════════
    
    function getProduct(string memory _productId) 
        external view 
        returns (Product memory) 
    {
        require(products[_productId].exists, "Product does not exist");
        return products[_productId];
    }
    
    function getRepairs(string memory _productId)
        external view
        returns (RepairRecord[] memory)
    {
        return repairs[_productId];
    }
    
    function getTransfers(string memory _productId)
        external view
        returns (TransferRecord[] memory)
    {
        return transfers[_productId];
    }
    
    function getProductCount() external view returns (uint256) {
        return totalProducts;
    }
    
    function getAllProductIds() external view returns (string[] memory) {
        return productIds;
    }
}
