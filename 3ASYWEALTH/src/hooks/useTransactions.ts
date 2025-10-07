import { useState, useCallback } from 'react'
import { ethers } from 'ethers'

interface Transaction {
  hash: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)

  const addTransaction = useCallback((hash: string) => {
    const newTx: Transaction = {
      hash,
      status: 'pending',
      timestamp: Date.now()
    }
    setTransactions(prev => [newTx, ...prev])
  }, [])

  const updateTransaction = useCallback((hash: string, status: Transaction['status']) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.hash === hash ? { ...tx, status } : tx
      )
    )
  }, [])

  const sendTransaction = useCallback(async (
    contract: ethers.Contract,
    method: string,
    args: unknown[] = [],
    overrides: ethers.Overrides = {}
  ) => {
    setLoading(true)
    try {
      const tx = await contract[method](...args, overrides)
      addTransaction(tx.hash)
      
      // Wait for confirmation
      const receipt = await tx.wait()
      updateTransaction(tx.hash, receipt.status === 1 ? 'confirmed' : 'failed')
      
      return { success: true, hash: tx.hash, receipt }
    } catch (error: unknown) {
      console.error('Transaction failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [addTransaction, updateTransaction])

  const sendEther = useCallback(async (
    signer: ethers.Signer,
    to: string,
    amount: string
  ) => {
    setLoading(true)
    try {
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseEther(amount)
      })
      addTransaction(tx.hash)
      
      const receipt = await tx.wait()
      updateTransaction(tx.hash, receipt?.status === 1 ? 'confirmed' : 'failed')
      
      return { success: true, hash: tx.hash, receipt }
    } catch (error: unknown) {
      console.error('ETH transfer failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    } finally {
      setLoading(false)
    }
  }, [addTransaction, updateTransaction])

  return {
    transactions,
    loading,
    sendTransaction,
    sendEther,
    addTransaction,
    updateTransaction
  }
}
