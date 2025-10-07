// src/components/auth/AzureLogin.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUnifiedAuth } from '@/components/UnifiedAuthProvider'
import { Building2, Shield, Users, Loader2 } from 'lucide-react'

export function AzureLogin() {
  const { login, loading, error } = useUnifiedAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Enterprise Login</CardTitle>
          <p className="text-gray-600">
            Sign in with your company Microsoft account
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button 
            onClick={login} 
            disabled={loading}
            className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21">
                  <rect fill="#f25022" width="10" height="10"/>
                  <rect fill="#00a4ef" x="11" width="10" height="10"/>
                  <rect fill="#7fba00" y="11" width="10" height="10"/>
                  <rect fill="#ffb900" x="11" y="11" width="10" height="10"/>
                </svg>
                Sign in with Microsoft
              </>
            )}
          </Button>

          {/* Benefits */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Single Sign-On (SSO)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Use your existing company account</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center text-xs text-gray-500">
            Powered by Microsoft Azure Active Directory
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
