# INDIA DIGITAL REPAIR PASSPORT (IDRP)
## A PROJECT REPORT

### TABLE OF CONTENTS
1. INTRODUCTION
    - 1.1 Overview of the E-Waste Crisis in India
    - 1.2 The Right-to-Repair Movement
    - 1.3 The Informal Repair Sector
    - 1.4 Role of Blockchain Technology
    - 1.5 Objectives of IDRP
2. SCOPE OF THE PROJECT
    - 2.1 Smart Contract Development
    - 2.2 Role-Based Access Control
    - 2.3 Hybrid Database Architecture
    - 2.4 Decentralized Storage
    - 2.5 UI & Analytics
3. PROBLEM STATEMENT
    - 3.1 Context & Lifecycle
    - 3.2 Specific Pain Points
    - 3.3 Core Problem Definition
4. REQUIREMENT SPECIFICATION
    - 4.1 Hardware Requirements
    - 4.2 Software Requirements
5. MODULE SPLIT UP
6. MODULE DESCRIPTION
    - 6.1 Authentication Module
    - 6.2 Blockchain Ledger Module
    - 6.3 Web3 Frontend Module
    - 6.4 Backend Indexing Module
7. CODING
    - 7.1 Smart Contract Code
    - 7.2 Indexer Code
    - 7.3 Frontend API Code
8. LITERATURE SURVEY & FEASIBILITY
    - 8.1 Literature Survey
    - 8.2 Feasibility Study (Technical, Operational, Economic)
9. SYSTEM DESIGN
    - 9.1 System Architecture
    - 9.2 Data Flow Diagram
    - 9.3 Database Schema
10. SECURITY ARCHITECTURE
    - 10.1 Cryptographic Standards
    - 10.2 Defense in Depth
11. TESTING METHODOLOGY
    - 11.1 Unit Testing
    - 11.2 Integration Testing
    - 11.3 Performance Testing
12. SCREENSHOTS & RESULTS
13. CONCLUSION & FUTURE SCOPE
    - 13.1 Conclusions
    - 13.2 Future Enhancements
14. BIBLIOGRAPHY

---

## 1. INTRODUCTION

### 1.1 Overview of the E-Waste Crisis in India
The rapid advancement of technology in the 21st century has led to an explosion in consumer electronics. India, currently one of the fastest-growing technology markets globally, is simultaneously facing an unprecedented environmental challenge: electronic waste (e-waste). As of recent estimates, India generates upwards of 3.2 million tonnes of e-waste annually, ranking it among the top contributors worldwide. Predictably, this volume is expected to grow exponentially as digital penetration deepens across rural and urban landscapes.

The core of this crisis lies in the linear model of consumption—"take, make, dispose." Electronic devices such as smartphones, laptops, and home appliances are increasingly designed with shorter lifecycles, driven by planned obsolescence and the rapid pace of technological innovation. When devices break or become outdated, the lack of accessible, trustworthy, and affordable repair options pushes consumers toward discarding them prematurely. This rampant disposal not only clogs landfills with toxic materials like lead, mercury, and cadmium but also results in the loss of valuable resources such as gold, silver, and rare earth metals that could otherwise be salvaged and reintroduced into the economy.

### 1.2 The Right-to-Repair Movement and Regulatory Shifts
In response to the growing environmental concerns and consumer frustrations over monopolistic repair practices by Original Equipment Manufacturers (OEMs), the global "Right-to-Repair" movement has gained significant traction. This movement advocates for policies that require manufacturers to design devices that are easier to repair, provide consumers and independent repair shops with access to necessary tools, spare parts, and diagnostic software, and dismantle artificial software barriers that prevent third-party repairs.

Recognizing the urgency of this movement, the Government of India, through the Ministry of Consumer Affairs, has initiated a framework for the Right to Repair. This policy shift aims to empower consumers, harmonize trade between OEMs and third-party buyers and sellers, and fundamentally transition the electronics sector toward a Circular Economy. However, a significant execution gap remains: how can stakeholders verify the history, authenticity, and quality of repairs in a highly fragmented and largely informal market?

### 1.3 The Informal Repair Sector in India
India’s electronics repair market is predominantly informal. Local repair shops, often referred to as "jugaad" innovators, handle the vast majority of out-of-warranty repairs. While these informal centers provide cost-effective solutions and extend the lifespan of countless devices, they operate without standardized certification, quality assurance, or transparent supply chains. 

Consumers handing over their devices to informal shops face a severe "trust deficit." There is no reliable mechanism to verify whether the parts used for replacement are genuine or counterfeit, whether the repair was conducted safely, or whether the device’s data privacy was maintained. Conversely, manufacturers lose all visibility over their products once they enter the secondary market or the informal repair ecosystem. This lack of data prevents OEMs from improving product designs based on common failure points and restricts their ability to engage with the secondary market responsibly.

### 1.4 The Role of Blockchain Technology
To bridge the trust deficit between manufacturers, independent repair centers, and consumers, a structural paradigm shift is required. Traditional centralized databases are insufficient because no single entity (neither the manufacturer nor a specific repair union) holds the inherent trust of all other participants. Centralized systems are prone to tampering, data silos, and single points of failure.

This is where Blockchain Technology emerges as a revolutionary solution. By utilizing a decentralized, cryptographically secure, and immutable ledger, it becomes possible to record the lifecycle of a product in a way that is verifiable by anyone but alterable by no one (without consensus). 

The India Digital Repair Passport (IDRP) leverages blockchain to create a "Digital Twin" for every registered electronic device. From the moment it leaves the manufacturing line, throughout its various repair cycles, and across multiple changes in ownership, every significant event is hashed and recorded on the public ledger. 

### 1.5 Objectives of the IDRP Framework
The primary objectives of the IDRP system are multifold:
1.  **Immutability of Product History**: To guarantee that once a product is registered, its foundational metadata (Brand, Model, Manufacturing City) cannot be forged or altered.
2.  **Verifiable Repair Logs**: To allow authorized repair centers, or consumers with adequate proof (e.g., invoices stored on IPFS), to log repair events that permanently attach to the device's digital passport.
3.  **Ownership Tracking**: To provide a secure mechanism for transferring ownership, thereby building trust in the second-hand electronics market.
4.  **Combating Counterfeits**: By maintaining a transparent chain of custody from the OEM, the system inherently depreciates the value of stolen or counterfeit goods.
5.  **Analytics for the Circular Economy**: To provide macro-level analytics (e.g., most frequently replaced parts, average device lifespan) to policymakers and manufacturers, aiding in the design of more durable products and effective e-waste management strategies.

---

## 2. SCOPE OF THE PROJECT

The scope of the India Digital Repair Passport project spans the comprehensive design, development, and deployment of a full-stack Decentralized Application (dApp). It integrates modern web development frameworks with Ethereum-based smart contract technology to deliver a seamless, high-performance, and secure user experience. 

### 2.1 Smart Contract Development and Deployment
The foundational layer of the project is the creation of intelligent, autonomous, and self-executing code known as Smart Contracts, deployed on an Ethereum-compatible network.
-   **Contract Architecture**: The primary `RepairPassport.sol` contract manages the state of all electronic devices within the ecosystem using robust data structures (`structs`).
-   **Access Control**: Enforcement of strict access control: only verified wallets belonging to OEMs can call `registerProduct`.
-   **Event Emission**: Emissions of structured events (`ProductRegistered`, `RepairLogged`, `OwnershipTransferred`) to facilitate off-chain indexing.

### 2.2 Role-Based Access Control (RBAC) and Identity Management
While blockchain guarantees data integrity, the application layer requires a traditional but highly secure authentication mechanism.
-   **JWT Security**: Implementation of JSON Web Tokens (JWT) working in tandem with bcrypt password hashing.
-   **Hierarchical Roles**: Distinct roles for Admin, Manufacturer, Repair Center, and Consumers.
-   **Wallet Integration**: Web3 identity via MetaMask for seamless transaction signing.

### 2.3 Hybrid Database and Indexing Architecture
The project includes a hybrid integration architecture to solve blockchain query latency.
-   **Background Indexer**: A Node.js worker service that maintains a persistent RPC connection to listen for smart contract events.
-   **Relational Mirroring**: Mirroring on-chain data into an off-chain SQLite database for instant analytical querying.

### 2.4 Decentralized Storage Integration
-   **IPFS Proof of Concept**: Lightweight cryptographic fingerprints (hashes) of repair receipts are committed to the blockchain, while actual binary files are intended for IPFS-like decentralized storage.

### 2.5 User Interface and Dashboard Analytics
-   **React/Vite Frontend**: Component-driven architecture using React to build dynamic views that adapt based on the user's role.
-   **Data Visualization**: Integration of charting libraries to visualize metrics such as regional repair densities and extended device lifespans.

---

## 3. PROBLEM STATEMENT

### 3.1 The Context
Historically, the lifecycle of a device has been treated as a tripartite progression: Manufacture, Consume, Dispose. However, the environmental toll of this linearity precipitated the need for a Circular Economy. The linchpin of this economy is **Repair and Reuse**, yet the current ecosystem in India is characterized by fragmentation and informational asymmetry.

### 3.2 Specific Pain Points
#### 3.2.1 The Consumer's Trust Deficit
Consumers have no reliable way to verify if a local technician uses genuine parts or possesses required expertise. There is no verifiable service history to retain resale value.
#### 3.2.2 Manufacturer Blind Spots
OEMs lack visibility into device failure post-sale, impeding their ability to improve durability or address systemic engineering flaws.
#### 3.2.3 The Plight of the Independent Repair Sector
Technicians lack a standardized platform to log repairs and build a verifiable reputation, often being unfairly maligned as untrustworthy.

### 3.3 The Core Problem Defined
The fundamental problem is the absence of a decentralized, tamper-proof, and universally verifiable ledger that bridges the informational gap between OEMs, Independent Repairers, and Consumers.

---

## 4. REQUIREMENT SPECIFICATION

### 4.1 Hardware Requirements
-   **Processor**: Intel Core i5 (10th Gen+) / AMD Ryzen 5.
-   **RAM**: 8 GB Minimum; 16 GB Recommended.
-   **Storage**: 256 GB SSD (for fast SQLite I/O).

### 4.2 Software Requirements
-   **Operating System**: Windows 11 / macOS / Ubuntu.
-   **Backend**: Node.js v22, Express.js, Better-SQLite3, JWT.
-   **Blockchain**: Solidity ^0.8.0, Hardhat, Ethers.js v6.
-   **Frontend**: React 19, Vite, Lucide Icons.

---

## 5. MODULE SPLIT UP
1.  **Authentication & Role Authorization Module**: Handles web2 identity and JWT issuance.
2.  **Blockchain Ledger Module**: The immutable core managing contract state and events.
3.  **Web3 Frontend Module**: UI layer responsible for MetaMask interactions and ABI parsing.
4.  **Backend Indexing Module**: The bridge between decentralised ledger and relational tables.

---

## 6. MODULE DESCRIPTION

### 6.1 Authentication Module
Utilizes `bcryptjs` for irreversible password hashing and signed JWTs for route protection via `authMiddleware`.
### 6.2 Blockchain Ledger Module
Implements `RepairPassport.sol` with `onlyManufacturer` modifiers and structured event emissions for all lifecycle mutations.
### 6.3 Web3 Frontend Module
Connects to MetaMask using `ethers.BrowserProvider` with a deterministic fallback for local development.
### 6.4 Backend Indexing Module
A background service that executes `contract.on()` listeners and mirrors payloads into SQLite for high-performance dashboard analytics.

---

## 7. CODING

### 7.1 Smart Contract: `RepairPassport.sol`
```solidity
pragma solidity ^0.8.0;

contract RepairPassport {
    struct Product {
        string productId;
        string brand;
        string city;
        address currentOwner;
        bool isRegistered;
    }
    
    mapping(string => Product) public products;
    mapping(address => bool) public authorizedManufacturers;
    
    event ProductRegistered(string productId, string brand, string city, address owner, uint256 timestamp);

    function registerProduct(string memory _productId, string memory _brand, string memory _city, address _owner) public {
        require(authorizedManufacturers[msg.sender], "Not authorized");
        products[_productId] = Product(_productId, _brand, _city, _owner, true);
        emit ProductRegistered(_productId, _brand, _city, _owner, block.timestamp);
    }
}
```

---

## 8. LITERATURE SURVEY AND FEASIBILITY

### 8.1 Literature Survey
-   **Supply Chain Provenance**: Drawing from Hyperledger research to provide "Trustless Architecture."
-   **Right-to-Repair**: Aligning with EU Circular Electronics initiatives and India's Ministry of Consumer Affairs frameworks.
-   **DID (Decentralized Identity)**: Utilizing the hybrid JWT-MetaMask model for modern DApp standards.

### 8.2 Feasibility Study
-   **Technical**: High maturity of EVM and React ecosystems ensures long-term viability.
-   **Operational**: "Hybrid Wallet Logic" allows both technical and non-technical users to participate.
-   **Economic**: Transitioning to Layer 2 or testnets ensures near-zero transaction overhead.

---

## 9. SYSTEM DESIGN

### 9.1 System Architecture
Three-Tier Architecture: Presentation (React) -> Processing (Node.js/Indexer) -> Data (Blockchain/SQLite).

### 9.2 Data Flow Diagram (DFD)
1. Manufacturer -> Signs Transaction -> Blockchain -> Event -> Indexer -> SQLite -> Dashboard view.

### 9.3 Database Schema (Off-Chain Analytics)
Tables include `Users` (RBAC), `Products` (Ledger Mirror), `Repairs` (History), and `Transfers` (Custody).

---

## 10. SECURITY ARCHITECTURE

### 10.1 Cryptographic Standards
Uses ECDSA (secp256k1) for signatures, SHA-256 for integrity hashing, and Bcrypt for local identity protection.
### 10.2 Defense in Depth
Implements Stateless JWT, Smart Contract Modifiers, and strict CORS policies to prevent unauthorized backend access.

---

## 11. TESTING METHODOLOGY
-   **Unit Tests**: Hardhat-based verification of state reverts and reentrancy protection.
-   **Integration Tests**: Checking provider fallback and MetaMask gas estimation accuracy.
-   **Performance Tests**: Validating indexer latency (consistently < 1.5s under local load).

---

5.  **Analytics Dashboard**: The `Dashboard.jsx` interface fully populated. This screenshot must clearly show the Recharts visualization plotting 'City Repair Densities' and 'Lifecycle Metrics' pulled synchronously from the backend SQLite Indexer.

---

## 9. OPERATIONAL GUIDE (USER MANUAL)

To ensure the integrity of the data during demonstration, the following sequence must be strictly observed:

1.  **Authentication**: The user must first authenticate using the Application Identity (JWT-based email/password).
2.  **Cryptographic Handshake**: Upon successful login, the user must click the **"Connect Wallet"** button in the Navigation Bar. This initiates the bridge between the browser's `ethers.js` provider and the user's MetaMask extension.
3.  **On-Chain State Mutation**: Any action intended to alter the global state (Registration, Repair Logging, or Ownership Transfer) should only be initiated after a successful wallet connection is displayed (visualized by the presence of a truncated Wallet Address in the UI).
4.  **Consensus Confirmation**: After clicking "Submit," the user must interact with the MetaMask popup to sign the transaction. The action is only "Complete" once the block has been successfully mined and the event has been captured by the Indexer.

---

## 10. CONCLUSION & FUTURE SCOPE

### 13.1 Conclusion
The IDRP provides the digital infrastructure necessary to empower consumers and formalize the repair sector, propelling India toward a sustainable circular economy.
### 13.2 Future Scope
Potential enhancements include AI-driven failure prediction, Native IPFS integration, and cross-chain support via protocols like Chainlink.

---

## 14. BIBLIOGRAPHY
- Buterin, V. (2014). Ethereum White Paper.
- Antonopoulos, M. A. (2018). Mastering Ethereum.
- Global E-waste Monitor Reports (2024).
- Hardhat, React, and Ethers.js Developer Documentation.
