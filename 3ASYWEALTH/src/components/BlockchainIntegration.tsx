import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useBlockchain } from '../hooks/useBlockchain'
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react'

export function BlockchainIntegration() {
  const { account, contract, balance, connectWallet, disconnectWallet, loading, error } = useBlockchain()

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Blockchain Wallet
        </CardTitle>
        <CardDescription>
          Connect your MetaMask wallet to interact with smart contracts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {!account ? (
          <Button 
            onClick={connectWallet} 
            disabled={loading} 
            className="w-full"
          >
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <Badge variant="outline" className="text-green-700 border-green-200">
                Connected
              </Badge>
              <p className="text-sm mt-1">
                <strong>Address:</strong> {formatAddress(account)}
              </p>
              {balance && (
                <p className="text-sm">
                  <strong>Balance:</strong> {balance} ETH
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Etherscan
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
              >
                Disconnect
              </Button>
            </div>

            {contract && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  ✅ Smart contract connected and ready to interact
                </p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Requires MetaMask browser extension</p>
          <p>• Supports Ethereum mainnet and testnets</p>
          <p>• Configure contract address in .env</p>
        </div>
      </CardContent>
    </Card>
  )
}
