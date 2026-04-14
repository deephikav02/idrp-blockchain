# India Digital Repair Passport (IDRP) 🛡️

A decentralized, blockchain-based system to track electronic products through their entire lifecycle—from manufacturing to repair and resale. Built with Ethereum (Sepolia), React, and Node.js.

## 🚀 Live Demo
- **Frontend**: [https://idrp-blockchain-1.onrender.com](https://idrp-blockchain-1.onrender.com)
- **Backend API**: [https://idrp-blockchain.onrender.com](https://idrp-blockchain.onrender.com)
- **Sepolia Contract**: `0x5810ba41aEdbdcD78B834aF338E29184285CFeb3`

## ✨ Features
- **Immutable Product Ledger**: Every product is registered on the Ethereum blockchain with a unique Digital Passport.
- **On-Chain Repair Logging**: Repairs are verified by authorized centers and logged permanently, preventing fraud.
- **Ownership Transfers**: Seamlessly transfer product ownership while maintaining a complete history of all previous owners.
- **Hybrid Authentication**: Secure combination of traditional JWT login and Web3 MetaMask wallet signing.
- **Real-time Indexing**: A background service that synchronizes on-chain events into a high-performance local database for the dashboard.
- **Dynamic Analytics**: Visual insights into repair trends, product lifecycles, and geographical data using Recharts.

## 🛠️ Tech Stack
- **Blockchain**: Solidity, Hardhat, Ethers.js
- **Network**: Ethereum Sepolia Testnet
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js (Express)
- **Database**: SQLite (Indexer Storage)
- **Hosting**: Render (Frontend & Backend)

## 📦 Project Structure
```text
├── contracts/          # Solidity Smart Contracts
├── scripts/            # Hardhat Deployment Scripts
├── src/                # React Frontend
│   ├── components/     # UI Components
│   ├── services/       # API & Web3 Providers
│   └── contracts/      # Contract ABIs
├── server/             # Express Backend
│   ├── services/       # Blockchain Indexer
│   ├── db/             # SQLite Data Layer
│   └── routes/         # REST API Endpoints
```

## ⚙️ Installation & Usage

### 1. Requirements
- Node.js (v18+)
- MetaMask Browser Extension
- Alchemy API Key (for Sepolia)

### 2. Local Setup
```bash
# Install dependencies
npm install

# Build the frontend artifacts
npm run build

# Start the local development node
npx hardhat node

# Deploy contract locally
npx hardhat run scripts/deploy.cjs --network localhost

# Start backend & frontend
npm run server
npm run dev
```

### 3. Usage Guide (Operational Flow)
For a successful demonstration, always follow these steps in order:
1.  **Sign In**: Use test credentials (e.g., `samsung@factory.com`).
2.  **Connect Wallet**: Click **"Connect Wallet"** in the top navbar. 
    *   *Critical:* Do this **before** submitting any data.
3.  **Perform Action**: Fill out a form (e.g., Register Product) and click Submit.
4.  **Confirm**: A MetaMask popup will appear. Click **Confirm** to pay.

### 4. Environment Configuration
Create a `.env` file in the root directory:
```env
ALCHEMY_RPC_URL=your_alchemy_url
PRIVATE_KEY=your_metamask_private_key
JWT_SECRET=your_jwt_secret
CONTRACT_ADDRESS=0x...
VITE_API_BASE=http://localhost:3001/api
VITE_CONTRACT_ADDRESS=0x...
```

## 🔒 Security
- Private keys are managed via environment variables and never committed to version control.
- Role-based Access Control (RBAC) ensures only Manufacturers can register products and only authorized centers can log repairs.

## 📜 License
MIT
