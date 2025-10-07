// src/hooks/useAuth.ts
import { useUnifiedAuth } from '@/components/UnifiedAuthProvider'

// Universal auth hook that works with both Supabase and Azure
export function useAuth() {
  const auth = useUnifiedAuth()
  
  return {
    // Core auth state
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    
    // Auth actions
    login: auth.login,
    logout: auth.logout,
    
    // Auth mode info
    authMode: auth.authMode,
    
    // Convenience methods
    isAuthenticated: auth.isAuthenticated,
    isAzureUser: auth.authMode === 'azure',
    isSupabaseUser: auth.authMode === 'supabase',
    
    // User info helpers
    getUserName: () => {
      if (!auth.user) return null
      return auth.user.name || auth.user.email || 'User'
    },
    
    getUserEmail: () => {
      if (!auth.user) return null
      return auth.user.email
    },
    
    // Role helpers (for Azure users)
    getUserRoles: () => {
      if (auth.authMode === 'azure' && auth.user?.groups) {
        return auth.user.groups
      }
      return []
    },
    
    hasRole: (role: string) => {
      if (auth.authMode === 'azure' && auth.user?.groups) {
        return auth.user.groups.includes(role)
      }
      return false
    }
  }
}
