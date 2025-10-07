// src/components/UnifiedAuthProvider.tsx
import React, { createContext, useContext, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance, isAzureModeEnabled } from '@/lib/azure'
import { useAzureAuth } from '@/hooks/useAzureAuth'
import { useAuth as useSupabaseAuth } from '@/integrations/supabase/auth'
import { User } from '@/types'

interface UnifiedAuthContextType {
  user: unknown
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  authMode: 'azure' | 'supabase'
  isAuthenticated: boolean
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | null>(null)

interface UnifiedAuthProviderProps {
  children: ReactNode
}

function AzureAuthWrapper({ children }: { children: ReactNode }) {
  const azureAuth = useAzureAuth()
  
  const contextValue: UnifiedAuthContextType = {
    user: azureAuth.user,
    loading: azureAuth.loading,
    error: azureAuth.error,
    login: azureAuth.login,
    logout: azureAuth.logout,
    authMode: 'azure' as const,
    isAuthenticated: Boolean(azureAuth.user)
  }

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

function SupabaseAuthWrapper({ children }: { children: ReactNode }) {
  const supabaseAuth = useSupabaseAuth()
  const navigate = useNavigate()
  
  const contextValue: UnifiedAuthContextType = {
    user: supabaseAuth.user,
    loading: supabaseAuth.loading,
    error: null,
    login: async () => {
      navigate('/login')
    },
    logout: async () => {
      await supabaseAuth.signOut()
    },
    authMode: 'supabase' as const,
    isAuthenticated: Boolean(supabaseAuth.user)
  }

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  if (isAzureModeEnabled()) {
    return (
      <MsalProvider instance={msalInstance}>
        <AzureAuthWrapper>{children}</AzureAuthWrapper>
      </MsalProvider>
    )
  }

  return (
    <SupabaseAuthWrapper>{children}</SupabaseAuthWrapper>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider')
  }
  return context
}
