# DeFi Lending DApp - Complete Setup Guide

## Prerequisites

**IMPORTANT: Node.js Version Requirement**
- This project requires **Node.js version 20 or higher** for Hardhat to work properly
- Your current version: v18.20.4
- **You need to upgrade Node.js before proceeding**

### How to Upgrade Node.js

**Option 1: Using nvm (Recommended)**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node.js version 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should show v20.x.x
```

**Option 2: Download from nodejs.org**
- Visit https://nodejs.org/
- Download and install Node.js v20 LTS or higher

## Installation Steps

Once you have Node.js 20+:

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install Hardhat and blockchain dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers
```

### 2. Start Local Blockchain Node
Open a **new terminal window** and run:
```bash
npx hardhat node
```
This will start a local Ethereum node at `http://localhost:8545` with 20 test accounts pre-funded with 10000 ETH each.

**Keep this terminal running!**

### 3. Deploy Smart Contract
Open **another terminal window** and run:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
- Compile the Lending smart contract
- Deploy it to your local blockchain
- Fund it with 100 ETH for the lending pool
- Display the deployed contract address

**IMPORTANT:** Copy the contract address from the output and update it in `app/page.tsx` on line 14:
```typescript
const CONTRACT_ADDRESS = "0xYourContractAddressHere"
```

### 4. Start the Frontend
In **another terminal window**, run:
```bash
npm run dev
```

Visit http://localhost:3000 to see your DeFi dApp!

## Project Structure

```
defi-dapp-master/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main DeFi interface
│   ├── layout.tsx         # Root layout
│   └── LendingABI.json    # Smart contract ABI
├── components/             # React components
├── contracts/             # Solidity smart contracts
│   └── Lending.sol        # Main lending contract
├── scripts/               # Deployment scripts
│   └── deploy.js          # Deploy script
├── hardhat.config.js      # Hardhat configuration
└── package.json           # Dependencies
```

## Features

1. **Deposit ETH** - Deposit your ETH to earn interest
2. **Borrow ETH** - Borrow against your deposits (200% collateral required)
3. **Repay Loans** - Repay your outstanding loans
4. **Send ETH** - Transfer ETH between wallets
5. **Transaction History** - Track all your transactions
6. **Wallet Switching** - Switch between 19 pre-funded Hardhat test accounts

## Troubleshooting

### Error: "Could not connect to server" or "Load failed"
- Make sure Hardhat node is running (`npx hardhat node`)
- Check that the contract is deployed to localhost
- Verify the CONTRACT_ADDRESS in `app/page.tsx` matches your deployed contract

### Error: "Insufficient collateral"
- You need 200% collateral to borrow
- Example: To borrow 1 ETH, you need to deposit at least 2 ETH first

### Hardhat Compilation Errors
- Make sure you're using Node.js 20 or higher
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Quick Start Commands (After Node.js 20+ is installed)

```bash
# Terminal 1: Start blockchain
npx hardhat node

# Terminal 2: Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Start frontend
npm run dev
```

## Notes

- All test accounts are pre-funded with 10000 ETH
- The blockchain state resets every time you restart the Hardhat node
- The contract address changes with each deployment
- This is a development environment only - not for production use
