# LendFlow - Decentralized Lending Protocol

A full-stack decentralized finance (DeFi) lending platform built with Next.js, Solidity, and Hardhat. This application enables users to deposit ETH as collateral, borrow against their deposits, and manage loans through a modern, intuitive interface.

## Features

### Core Functionality
- **Collateralized Lending**: Deposit ETH and borrow against your collateral with a 200% collateralization ratio
- **Interest-Free Loans**: Borrow ETH without interest charges (configurable for future enhancements)
- **Flexible Repayment**: Repay loans at any time with automatic collateral release
- **Real-Time Balance Tracking**: Monitor deposits, loans, and available balances in real-time
- **Transaction History**: Complete audit trail of all lending activities
- **Multi-Wallet Support**: Switch between 19 pre-funded Hardhat test accounts seamlessly

### Technical Highlights
- **Smart Contract Security**: Implements collateralization checks and balance validations
- **Modern UI/UX**: Built with React 19, Framer Motion animations, and Tailwind CSS 4
- **Type Safety**: Full TypeScript implementation across frontend
- **Web3 Integration**: Direct blockchain interaction using Web3.js 4.16
- **Local Development**: Complete Hardhat development environment with instant testing

## Tech Stack

### Frontend
- **Next.js 15.3.0** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion 12** - Smooth animations
- **Web3.js 4.16** - Ethereum JavaScript API
- **Lucide React** - Modern icon library

### Blockchain
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Ethereum development environment
- **Ethers.js** - Ethereum library for contract interaction
- **Local Hardhat Network** - Instant blockchain testing with pre-funded accounts

## Prerequisites

**IMPORTANT: Node.js Version Requirement**
- Node.js **20 or higher** is required for Hardhat to function properly
- Check your version: `node --version`

### Upgrading Node.js

**Option 1: Using nvm (Recommended)**
```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# Verify installation
node --version  # Should show v20.x.x
```

**Option 2: Direct Download**
- Visit [nodejs.org](https://nodejs.org/)
- Download and install Node.js v20 LTS or higher

## Installation & Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Hardhat and blockchain development tools
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-ethers ethers
```

### 2. Start Local Blockchain

Open a new terminal and start the Hardhat node:

```bash
npx hardhat node
```

This creates a local Ethereum network at `http://localhost:8545` with:
- 20 test accounts pre-funded with 10,000 ETH each
- Instant block mining for immediate transaction confirmation
- Complete blockchain explorer output

**Keep this terminal running throughout development.**

### 3. Deploy Smart Contract

Open a second terminal and deploy the lending contract:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

This will:
1. Compile the Lending.sol smart contract
2. Deploy it to your local blockchain
3. Fund the contract with 100 ETH for the lending pool
4. Display the deployed contract address

**IMPORTANT:** Copy the contract address from the output and update [app/page.tsx:14](app/page.tsx#L14):

```typescript
const CONTRACT_ADDRESS = "0xYourNewContractAddressHere"
```

### 4. Start the Frontend

Open a third terminal and launch the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the DeFi application.

## Project Structure

```
defi-dapp-master/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Main DeFi lending interface
│   ├── layout.tsx                # Root layout with global styles
│   ├── globals.css               # Tailwind CSS configuration
│   └── LendingABI.json          # Smart contract ABI
├── components/                   # React components (if any)
├── contracts/                    # Solidity smart contracts
│   └── Lending.sol              # Main lending protocol contract
├── scripts/                      # Deployment and utility scripts
│   └── deploy.js                # Contract deployment script
├── hardhat.config.js            # Hardhat configuration
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── tailwind.config.ts           # Tailwind CSS configuration
└── README.md                    # This file
```

## Smart Contract Architecture

### Lending.sol

The core lending contract implements a simple yet secure collateralized lending protocol:

```solidity
contract Lending {
    mapping(address => uint256) public deposits;  // User deposits
    mapping(address => uint256) public loans;     // Outstanding loans

    function deposit() public payable             // Deposit ETH as collateral
    function borrow(uint256 amount) public        // Borrow against collateral
    function repay() public payable               // Repay outstanding loans
    function getBalance() public view returns (uint256)  // Contract balance
}
```

**Key Features:**
- 200% collateralization requirement (deposit 2 ETH to borrow 1 ETH)
- Automatic balance validation and insufficient collateral checks
- Event emission for all state changes (Deposit, Borrow, Repay)
- Payable fallback function for direct ETH transfers

## Usage Guide

### Depositing ETH
1. Select a wallet from the dropdown (19 Hardhat test accounts available)
2. Enter the amount of ETH to deposit
3. Click "Deposit" to add collateral to the lending pool
4. View your updated deposit balance in real-time

### Borrowing ETH
1. Ensure you have sufficient collateral (2x the borrow amount)
2. Enter the amount of ETH to borrow
3. Click "Borrow" to receive ETH against your collateral
4. Monitor your loan balance and available borrow capacity

### Repaying Loans
1. Enter the amount of ETH to repay
2. Click "Repay" to reduce your outstanding loan
3. Full repayment releases your collateral proportionally

### Sending ETH
1. Enter recipient address and amount
2. Click "Send ETH" to transfer between wallets
3. Useful for testing with multiple Hardhat accounts

## Development Workflow

### Quick Start (Three Terminal Setup)

```bash
# Terminal 1: Blockchain
npx hardhat node

# Terminal 2: Smart Contract Deployment
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3: Frontend
npm run dev
```

### Testing Smart Contracts

```bash
# Run Hardhat tests
npx hardhat test

# Run tests with gas reporting
REPORT_GAS=true npx hardhat test
```

### Building for Production

```bash
# Build optimized frontend
npm run build

# Start production server
npm start
```

## Troubleshooting

### Connection Errors

**Error:** "Could not connect to the server" or "Load failed"

**Solution:**
- Ensure Hardhat node is running in a separate terminal
- Verify the blockchain is accessible at `http://localhost:8545`
- Check that the contract address in `app/page.tsx` matches your deployment

### Insufficient Collateral

**Error:** "Insufficient collateral (need 200%)"

**Solution:**
- Deposit at least 2x the amount you want to borrow
- Example: To borrow 1 ETH, deposit minimum 2 ETH first
- Check your current deposit and loan balances

### Hardhat Compilation Errors

**Error:** Node version or dependency issues

**Solution:**
- Verify Node.js version 20+ is installed: `node --version`
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again with clean dependencies
- Ensure all Hardhat packages are compatible versions

### Transaction Failures

**Error:** Transaction reverted or failed

**Solution:**
- Check wallet has sufficient ETH for transaction + gas fees
- Verify contract has sufficient balance for borrows
- Ensure you're not exceeding borrow limits
- Review transaction details in Hardhat console output

## Configuration

### Network Settings

Modify [hardhat.config.js](hardhat.config.js) for custom network configurations:

```javascript
networks: {
  hardhat: {
    chainId: 31337,        // Local network chain ID
  },
  localhost: {
    url: "http://127.0.0.1:8545",
  },
}
```

### Contract Parameters

Adjust collateralization ratio in [contracts/Lending.sol:21](contracts/Lending.sol#L21):

```solidity
require(deposits[msg.sender] >= amount * 2, "Insufficient collateral (need 200%)");
// Change '2' to modify collateralization requirement
```

## Security Considerations

**Development Use Only**: This is a development/educational project and should NOT be deployed to mainnet without:
- Comprehensive security audits
- Access control implementation
- Interest rate mechanisms
- Liquidation protocols
- Oracle integration for price feeds
- Emergency pause functionality
- Upgradability patterns

## Key Notes

- All test accounts are pre-funded with 10,000 ETH for development
- Blockchain state resets when you restart the Hardhat node
- Contract address changes with each deployment
- Gas fees are simulated but not actual cost in local development
- Private keys are for Hardhat test accounts only - never use in production

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [Ethereum Development Guides](https://ethereum.org/en/developers/)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

For issues, questions, or contributions, please open an issue in the repository.

---

**Built with** Next.js • React • Solidity • Hardhat • Web3.js
