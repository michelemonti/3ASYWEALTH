import { useCallback, useState, useEffect } from 'react'
import { ethers } from 'ethers'

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
const CONTRACT_ABI: ethers.InterfaceAbi = [] // Provide your ABI to enable

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

export function useBlockchain() {
  const [account, setAccount] = useState<string | null>(null)
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getBalance = useCallback(async (address: string) => {
    try {
      if (!window.ethereum) return
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balanceWei = await provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(parseFloat(balanceEth).toFixed(4))
    } catch (err) {
      console.error('Failed to get balance:', err)
    }
  }, [])

  const connectWallet = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.')
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      
      setAccount(address)
      await getBalance(address)

      if (CONTRACT_ADDRESS && CONTRACT_ABI.length > 0) {
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
        setContract(contractInstance)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet')
    } finally {
      setLoading(false)
    }
  }, [getBalance])

  const disconnectWallet = useCallback(() => {
    setAccount(null)
    setContract(null)
    setBalance(null)
    setError(null)
  }, [])

  // Auto-connect if already connected
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (!window.ethereum) return
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          const address = accounts[0].address
          setAccount(address)
          await getBalance(address)
          
          if (CONTRACT_ADDRESS && CONTRACT_ABI.length > 0) {
            const signer = await provider.getSigner()
            const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
            setContract(contractInstance)
          }
        }
      } catch (err) {
        console.error('Failed to check connection:', err)
      }
    }
    
    checkConnection()
  }, [getBalance])

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        getBalance(accounts[0])
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [account, getBalance, disconnectWallet])

  return { 
    account, 
    contract, 
    balance, 
    loading, 
    error, 
    connectWallet, 
    disconnectWallet 
  }
}
