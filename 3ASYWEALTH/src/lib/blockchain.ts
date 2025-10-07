// Example smart contract utilities
// Add your contract address and ABI to make this functional

export const SAMPLE_CONTRACT_ABI = [
  // ERC-20 Token Standard functions (example)
  "function name() view returns (string)",
  "function symbol() view returns (string)", 
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)"
]

// Example: Simple Greeter Contract ABI
export const GREETER_CONTRACT_ABI = [
  "function greet() view returns (string)",
  "function setGreeting(string memory _greeting) returns (bool)",
  "event GreetingChanged(string greeting)"
]

// Network configurations
export const NETWORKS = {
  ethereum: {
    chainId: '0x1',
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io'
  },
  sepolia: {
    chainId: '0xaa36a7',
    name: 'Sepolia Testnet',
    currency: 'SepoliaETH',
    explorerUrl: 'https://sepolia.etherscan.io'
  },
  polygon: {
    chainId: '0x89',
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    explorerUrl: 'https://polygonscan.com'
  }
}

// Utility functions
export const formatTokenAmount = (amount: bigint, decimals: number = 18): string => {
  return (Number(amount) / Math.pow(10, decimals)).toFixed(4)
}

export const parseTokenAmount = (amount: string, decimals: number = 18): bigint => {
  return BigInt(Math.floor(parseFloat(amount) * Math.pow(10, decimals)))
}

// Contract deployment example (commented out)
/*
export const deployContract = async (signer: ethers.Signer, bytecode: string, ...args: any[]) => {
  const factory = new ethers.ContractFactory(CONTRACT_ABI, bytecode, signer)
  const contract = await factory.deploy(...args)
  await contract.deployed()
  return contract
}
*/
