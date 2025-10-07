# Blockchain Integration Setup

This template comes with **Ethers.js v6** blockchain integration ready to use.

## Quick Start

1. **Install MetaMask** browser extension
2. **Configure environment** variables in `.env`
3. **Add your contract ABI** to enable smart contract interactions

## Environment Configuration

```env
# Basic blockchain setup
VITE_CONTRACT_ADDRESS=0x1234567890123456789012345678901234567890
VITE_NETWORK_CHAIN_ID=1

# Optional: Provider APIs for better performance
VITE_INFURA_PROJECT_ID=your_infura_project_id
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

## Usage Examples

### 1. Connect Wallet Component

```tsx
import { BlockchainIntegration } from '@/components/BlockchainIntegration'

function App() {
  return <BlockchainIntegration />
}
```

### 2. Use Blockchain Hook

```tsx
import { useBlockchain } from '@/hooks/useBlockchain'

function MyComponent() {
  const { account, contract, connectWallet } = useBlockchain()
  
  return (
    <div>
      {account ? (
        <p>Connected: {account}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  )
}
```

### 3. Send Transactions

```tsx
import { useTransactions } from '@/hooks/useTransactions'

function SendTransaction() {
  const { sendTransaction, loading } = useTransactions()
  const { contract } = useBlockchain()
  
  const handleSend = async () => {
    if (!contract) return
    const result = await sendTransaction(contract, 'transfer', [
      '0xRecipientAddress',
      ethers.parseEther('1.0')
    ])
    console.log('Transaction result:', result)
  }
  
  return (
    <button onClick={handleSend} disabled={loading}>
      Send Transaction
    </button>
  )
}
```

## Smart Contract Setup

1. **Add your contract ABI** to `src/hooks/useBlockchain.ts`:

```typescript
const CONTRACT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  // Add your contract functions here
]
```

2. **Deploy your contract** and add the address to `.env`:

```env
VITE_CONTRACT_ADDRESS=0xYourContractAddress
```

## Supported Networks

- Ethereum Mainnet (Chain ID: 1)
- Sepolia Testnet (Chain ID: 11155111)  
- Polygon Mainnet (Chain ID: 137)
- Custom networks via MetaMask

## Features Included

✅ **Wallet Connection** - MetaMask integration with auto-reconnect
✅ **Balance Display** - Real-time ETH balance updates
✅ **Smart Contracts** - Easy contract interaction setup
✅ **Transaction Handling** - Send ETH and contract transactions
✅ **Network Detection** - Automatic network switching support
✅ **Error Handling** - Comprehensive error states
✅ **TypeScript Support** - Full type safety with Ethers.js

## Development Tips

- Use **Sepolia testnet** for development and testing
- Get free testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)
- Test contract interactions on testnets before mainnet deployment
- Use [Hardhat](https://hardhat.org/) for local blockchain development

## Security Best Practices

- Never commit private keys or mnemonics to version control
- Always validate user inputs before sending transactions
- Implement proper access controls in your smart contracts
- Use established contract patterns and libraries (OpenZeppelin)
- Audit contracts before mainnet deployment

---

**Template curated by Michele Miky Monti – Entrepreneur & Technology Generalist** 🚀
