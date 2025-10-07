// src/components/ProtectedRoute.tsx
import React, { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginPage } from '@/pages/LoginPage'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredRoles?: string[]
  fallback?: ReactNode
}

export function ProtectedRoute({ 
  children, 
  requiredRoles = [],
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, hasRole, authMode } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {authMode === 'azure' ? 'Checking Azure credentials...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return fallback || <LoginPage />
  }

  // Check role requirements (only for Azure users)
  if (requiredRoles.length > 0 && authMode === 'azure') {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role))
    
    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Required roles: {requiredRoles.join(', ')}
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}
