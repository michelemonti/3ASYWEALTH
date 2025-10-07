# Azure AD Authentication Integration - 3ASYAPP Template

**Enterprise-grade authentication using Microsoft Azure Active Directory (Entra ID)**

## 🎯 Overview

The 3ASYAPP template supports dual authentication modes:
1. **Supabase Authentication** (default) - For startups and rapid development
2. **Azure AD Authentication** (enterprise) - For corporate environments with existing Microsoft infrastructure

This guide covers the Azure AD integration for organizations that want to leverage their existing Microsoft ecosystem.

## 🏢 Why Azure AD Integration?

### **Enterprise Benefits**
- **Single Sign-On (SSO)** - Users login with their existing company credentials
- **Corporate Security** - Leverage your organization's security policies
- **Admin Control** - IT departments can manage access centrally
- **Compliance** - Meet enterprise compliance requirements
- **Zero User Onboarding** - Employees use existing accounts

### **Technical Benefits**
- **Multi-tenant Support** - Serve multiple organizations
- **Conditional Access** - Advanced security policies
- **MFA Integration** - Multi-factor authentication built-in
- **Audit Logging** - Comprehensive access logs
- **Role-based Access** - Azure AD groups as application roles

---

## 🚀 Quick Azure AD Setup (15 minutes)

### Step 1: Azure App Registration

1. **Go to Azure Portal**
   - Navigate to [portal.azure.com](https://portal.azure.com)
   - Sign in with your Azure account

2. **Create App Registration**
   ```bash
   # In Azure Portal:
   # 1. Go to "Azure Active Directory"
   # 2. Click "App registrations"
   # 3. Click "New registration"
   # 4. Fill in the details:
   ```

   **App Registration Settings:**
   - **Name**: `3ASYAPP - Your Company Name`
   - **Account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: `Single-page application (SPA)` → `http://localhost:8080/auth/callback`

3. **Get Application Credentials**
   ```bash
   # After registration, copy these values:
   # Overview page:
   Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

### Step 2: Configure App Permissions

1. **API Permissions**
   - Go to "API permissions"
   - Add permissions for Microsoft Graph:
     - `User.Read` (Delegated) - Read user profile
     - `email` (Delegated) - Access user email
     - `profile` (Delegated) - Access basic profile
     - `openid` (Delegated) - OpenID Connect sign-in

2. **Authentication Settings**
   - Go to "Authentication"
   - Enable "Access tokens" and "ID tokens"
   - Add production redirect URI: `https://yourdomain.com/auth/callback`

### Step 3: Install Azure Dependencies

```bash
# Install Microsoft Authentication Library
npm install @azure/msal-browser @azure/msal-react

# Install additional utilities
npm install jwt-decode
```

### Step 4: Environment Configuration

```bash
# Add to your .env file
# Azure AD Configuration
VITE_AZURE_CLIENT_ID=your-client-id-here
VITE_AZURE_TENANT_ID=your-tenant-id-here
VITE_AZURE_REDIRECT_URI=http://localhost:8080/auth/callback

# Authentication Mode (choose one)
VITE_AUTH_MODE=azure  # or 'supabase' for default
```

---

## 🔧 Azure AD Implementation

### MSAL Configuration

```typescript
// src/lib/azure.ts
import { Configuration, PublicClientApplication } from '@azure/msal-browser'

// Azure AD configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin + '/auth/callback',
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        console.log(message)
      }
    }
  }
}

// Login request configuration
export const loginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
  prompt: 'select_account'
}

// Token request for API calls
export const tokenRequest = {
  scopes: ['User.Read'],
  account: null as any
}

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
export const initializeMsal = async () => {
  try {
    await msalInstance.initialize()
    
    // Handle redirect promise
    const response = await msalInstance.handleRedirectPromise()
    if (response) {
      console.log('Login successful:', response)
    }
  } catch (error) {
    console.error('MSAL initialization error:', error)
  }
}
```

### Azure Authentication Hook

```typescript
// src/hooks/useAzureAuth.ts
import { useEffect, useState } from 'react'
import { AuthenticationResult, AccountInfo } from '@azure/msal-browser'
import { msalInstance, loginRequest, tokenRequest } from '@/lib/azure'
import jwtDecode from 'jwt-decode'

interface AzureUser {
  id: string
  email: string
  name: string
  givenName?: string
  surname?: string
  jobTitle?: string
  department?: string
  officeLocation?: string
  groups?: string[]
}

export function useAzureAuth() {
  const [user, setUser] = useState<AzureUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      setLoading(true)
      
      // Check for existing session
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length > 0) {
        const account = accounts[0]
        await getUserProfile(account)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const login = async () => {
    try {
      setLoading(true)
      setError(null)

      // Redirect to Azure AD login
      await msalInstance.loginRedirect(loginRequest)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed')
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await msalInstance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin
      })
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const getUserProfile = async (account: AccountInfo) => {
    try {
      // Set account for token request
      tokenRequest.account = account

      // Get access token
      const response = await msalInstance.acquireTokenSilent(tokenRequest)
      
      // Call Microsoft Graph API to get user profile
      const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!graphResponse.ok) {
        throw new Error('Failed to fetch user profile')
      }

      const profile = await graphResponse.json()

      // Get user groups (optional)
      const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
        headers: {
          'Authorization': `Bearer ${response.accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      let groups: string[] = []
      if (groupsResponse.ok) {
        const groupsData = await groupsResponse.json()
        groups = groupsData.value?.map((group: any) => group.displayName) || []
      }

      const azureUser: AzureUser = {
        id: profile.id,
        email: profile.mail || profile.userPrincipalName,
        name: profile.displayName,
        givenName: profile.givenName,
        surname: profile.surname,
        jobTitle: profile.jobTitle,
        department: profile.department,
        officeLocation: profile.officeLocation,
        groups
      }

      setUser(azureUser)
    } catch (error) {
      console.error('Error getting user profile:', error)
      setError('Failed to get user profile')
    }
  }

  const getAccessToken = async (): Promise<string | null> => {
    try {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length === 0) return null

      tokenRequest.account = accounts[0]
      const response = await msalInstance.acquireTokenSilent(tokenRequest)
      return response.accessToken
    } catch (error) {
      console.error('Token acquisition error:', error)
      return null
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    getAccessToken
  }
}
```

### Unified Auth Provider

```typescript
// src/components/UnifiedAuthProvider.tsx
import React, { createContext, useContext } from 'react'
import { MsalProvider } from '@azure/msal-react'
import { msalInstance } from '@/lib/azure'
import { useAzureAuth } from '@/hooks/useAzureAuth'
import { useAuth as useSupabaseAuth } from '@/components/AuthProvider'

interface UnifiedAuthContextType {
  user: any
  loading: boolean
  error: string | null
  login: () => Promise<void>
  logout: () => Promise<void>
  authMode: 'azure' | 'supabase'
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | null>(null)

interface UnifiedAuthProviderProps {
  children: React.ReactNode
}

function AzureAuthWrapper({ children }: { children: React.ReactNode }) {
  const azureAuth = useAzureAuth()
  
  const contextValue: UnifiedAuthContextType = {
    ...azureAuth,
    authMode: 'azure' as const
  }

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

function SupabaseAuthWrapper({ children }: { children: React.ReactNode }) {
  const supabaseAuth = useSupabaseAuth()
  
  const contextValue: UnifiedAuthContextType = {
    user: supabaseAuth.user,
    loading: supabaseAuth.loading,
    error: null,
    login: async () => {
      // Redirect to login page for Supabase
      window.location.href = '/auth/login'
    },
    logout: supabaseAuth.signOut,
    authMode: 'supabase' as const
  }

  return (
    <UnifiedAuthContext.Provider value={contextValue}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  const authMode = import.meta.env.VITE_AUTH_MODE || 'supabase'

  if (authMode === 'azure') {
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

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (!context) {
    throw new Error('useUnifiedAuth must be used within UnifiedAuthProvider')
  }
  return context
}
```

---

## 🎨 Azure Authentication UI

### Login Component

```typescript
// src/components/azure/AzureLogin.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUnifiedAuth } from '@/components/UnifiedAuthProvider'
import { Building2, Shield, Users } from 'lucide-react'

export function AzureLogin() {
  const { login, loading, error } = useUnifiedAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">Enterprise Login</CardTitle>
          <p className="text-muted-foreground">
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
            className="w-full h-12 text-base"
            size="lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <img 
                  src="/microsoft-logo.svg" 
                  alt="Microsoft" 
                  className="w-5 h-5 mr-2"
                />
                Sign in with Microsoft
              </>
            )}
          </Button>

          {/* Benefits */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Enterprise-grade security</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Single Sign-On (SSO)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Use your existing company account</span>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center text-xs text-muted-foreground">
            Powered by Microsoft Azure Active Directory
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### User Profile Component

```typescript
// src/components/azure/AzureProfile.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUnifiedAuth } from '@/components/UnifiedAuthProvider'
import { 
  User, 
  Mail, 
  Building2, 
  MapPin, 
  Briefcase,
  LogOut,
  Shield
} from 'lucide-react'

export function AzureProfile() {
  const { user, logout, authMode } = useUnifiedAuth()

  if (!user || authMode !== 'azure') return null

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </CardTitle>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            <Shield className="w-3 h-3 mr-1" />
            Azure AD
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Display Name
            </label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span>{user.name}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Email Address
            </label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          </div>

          {user.jobTitle && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Job Title
              </label>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                <span>{user.jobTitle}</span>
              </div>
            </div>
          )}

          {user.department && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Department
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span>{user.department}</span>
              </div>
            </div>
          )}

          {user.officeLocation && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Office Location
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{user.officeLocation}</span>
              </div>
            </div>
          )}
        </div>

        {/* Groups/Roles */}
        {user.groups && user.groups.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Azure AD Groups
            </label>
            <div className="flex flex-wrap gap-2">
              {user.groups.map((group, index) => (
                <Badge key={index} variant="secondary">
                  {group}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={logout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 🔧 Database Integration

### Azure User Sync

```typescript
// src/lib/azure/userSync.ts
import { supabase } from '@/lib/supabase'

export interface AzureUserSync {
  id: string
  azure_id: string
  email: string
  full_name: string
  job_title?: string
  department?: string
  office_location?: string
  azure_groups: string[]
  last_login: string
  created_at: string
  updated_at: string
}

export async function syncAzureUser(azureUser: any): Promise<AzureUserSync | null> {
  try {
    const userData = {
      azure_id: azureUser.id,
      email: azureUser.email,
      full_name: azureUser.name,
      job_title: azureUser.jobTitle,
      department: azureUser.department,
      office_location: azureUser.officeLocation,
      azure_groups: azureUser.groups || [],
      last_login: new Date().toISOString()
    }

    // Upsert user (insert or update if exists)
    const { data, error } = await supabase
      .from('azure_users')
      .upsert(userData, {
        onConflict: 'azure_id'
      })
      .select()
      .single()

    if (error) {
      console.error('User sync error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Azure user sync failed:', error)
    return null
  }
}

export async function getAzureUser(azureId: string): Promise<AzureUserSync | null> {
  try {
    const { data, error } = await supabase
      .from('azure_users')
      .select('*')
      .eq('azure_id', azureId)
      .single()

    if (error) {
      console.error('Get Azure user error:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to get Azure user:', error)
    return null
  }
}

// Role mapping based on Azure AD groups
export function mapAzureGroupsToRoles(groups: string[]): string[] {
  const roleMapping: Record<string, string> = {
    'Admin Users': 'admin',
    'Managers': 'manager',
    'Department Heads': 'manager',
    'All Company': 'user'
  }

  const roles = groups
    .map(group => roleMapping[group])
    .filter(Boolean)

  // Default role if no mapping found
  return roles.length > 0 ? roles : ['user']
}
```

### Database Schema for Azure Users

```sql
-- Add to your database setup script
-- Azure AD users table
CREATE TABLE azure_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    azure_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    job_title TEXT,
    department TEXT,
    office_location TEXT,
    azure_groups JSONB DEFAULT '[]',
    roles TEXT[] DEFAULT ARRAY['user'],
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_azure_users_azure_id ON azure_users(azure_id);
CREATE INDEX idx_azure_users_email ON azure_users(email);
CREATE INDEX idx_azure_users_department ON azure_users(department);

-- Enable RLS
ALTER TABLE azure_users ENABLE ROW LEVEL SECURITY;

-- Policies for Azure users
CREATE POLICY "Users can view own Azure profile" ON azure_users
    FOR SELECT USING (azure_id = current_setting('app.current_azure_id', true));

-- Update trigger
CREATE TRIGGER update_azure_users_updated_at 
    BEFORE UPDATE ON azure_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Business entities policy for Azure users
CREATE POLICY "Azure users can manage own entities" ON business_entities
    FOR ALL USING (
        owner_id IN (
            SELECT id FROM azure_users WHERE azure_id = current_setting('app.current_azure_id', true)
        )
    );
```

---

## ⚙️ Environment Configuration

### Dual Mode Setup

```bash
# .env - Complete configuration for both auth modes

# =============================================
# AUTHENTICATION MODE SELECTION
# =============================================
# Choose your authentication method:
# - 'supabase' for Supabase Auth (default, good for startups)
# - 'azure' for Azure AD (enterprise, SSO)
VITE_AUTH_MODE=azure

# =============================================
# AZURE AD CONFIGURATION (for enterprise)
# =============================================
# Get these from your Azure App Registration
VITE_AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
VITE_AZURE_REDIRECT_URI=http://localhost:8080/auth/callback

# Optional: Azure-specific settings
VITE_AZURE_CLOUD_INSTANCE=https://login.microsoftonline.com/
VITE_AZURE_GRAPH_ENDPOINT=https://graph.microsoft.com/

# =============================================
# SUPABASE CONFIGURATION (for standard auth)
# =============================================
# Keep these for fallback or dual-mode support
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# =============================================
# SHARED CONFIGURATION
# =============================================
# These work with both authentication modes
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
VITE_CONTRACT_ADDRESS=0xYourSmartContractAddress
```

### Runtime Environment Detection

```typescript
// src/lib/config.ts
export const AUTH_CONFIG = {
  mode: (import.meta.env.VITE_AUTH_MODE || 'supabase') as 'azure' | 'supabase',
  
  azure: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI,
    enabled: Boolean(import.meta.env.VITE_AZURE_CLIENT_ID)
  },
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL)
  }
}

export const isAzureMode = () => AUTH_CONFIG.mode === 'azure'
export const isSupabaseMode = () => AUTH_CONFIG.mode === 'supabase'
```

---

## 🔒 Security Considerations

### Token Management

```typescript
// src/lib/azure/security.ts
import { msalInstance } from '@/lib/azure'

export class AzureTokenManager {
  private static instance: AzureTokenManager
  private tokenCache = new Map<string, { token: string; expires: number }>()

  static getInstance(): AzureTokenManager {
    if (!this.instance) {
      this.instance = new AzureTokenManager()
    }
    return this.instance
  }

  async getValidToken(scopes: string[]): Promise<string | null> {
    const cacheKey = scopes.join(',')
    const cached = this.tokenCache.get(cacheKey)

    // Check if cached token is still valid (with 5 min buffer)
    if (cached && cached.expires > Date.now() + 300000) {
      return cached.token
    }

    try {
      const accounts = msalInstance.getAllAccounts()
      if (accounts.length === 0) return null

      const response = await msalInstance.acquireTokenSilent({
        scopes,
        account: accounts[0]
      })

      // Cache the token
      this.tokenCache.set(cacheKey, {
        token: response.accessToken,
        expires: response.expiresOn?.getTime() || Date.now() + 3600000
      })

      return response.accessToken
    } catch (error) {
      console.error('Token acquisition failed:', error)
      this.tokenCache.delete(cacheKey)
      return null
    }
  }

  clearCache(): void {
    this.tokenCache.clear()
  }
}
```

### Role-Based Access Control

```typescript
// src/hooks/useAzureRoles.ts
import { useUnifiedAuth } from '@/components/UnifiedAuthProvider'
import { mapAzureGroupsToRoles } from '@/lib/azure/userSync'

export function useAzureRoles() {
  const { user, authMode } = useUnifiedAuth()

  const roles = authMode === 'azure' && user?.groups
    ? mapAzureGroupsToRoles(user.groups)
    : ['user']

  const hasRole = (role: string): boolean => {
    return roles.includes(role)
  }

  const hasAnyRole = (checkRoles: string[]): boolean => {
    return checkRoles.some(role => roles.includes(role))
  }

  const isAdmin = (): boolean => {
    return hasRole('admin')
  }

  const isManager = (): boolean => {
    return hasRole('manager') || hasRole('admin')
  }

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin,
    isManager
  }
}
```

---

## 📋 Azure AD Integration Checklist

### Azure Setup
- [ ] Create Azure App Registration
- [ ] Configure redirect URIs (dev + production)
- [ ] Set up API permissions (User.Read, email, profile, openid)
- [ ] Enable access tokens and ID tokens
- [ ] Note down Client ID and Tenant ID

### Code Integration
- [ ] Install Azure MSAL packages
- [ ] Configure environment variables
- [ ] Set up MSAL configuration
- [ ] Implement useAzureAuth hook
- [ ] Create UnifiedAuthProvider
- [ ] Update main app to use UnifiedAuthProvider
- [ ] Add Azure login UI components

### Database Schema
- [ ] Create azure_users table
- [ ] Set up indexes and RLS policies
- [ ] Update business_entities policies for Azure users
- [ ] Test user sync functionality

### Testing
- [ ] Test Azure AD login flow
- [ ] Verify user profile data sync
- [ ] Test role-based access control
- [ ] Verify token refresh mechanism
- [ ] Test logout functionality

### Production
- [ ] Update production redirect URIs in Azure
- [ ] Set up production environment variables
- [ ] Configure production database
- [ ] Test end-to-end authentication flow
- [ ] Set up monitoring and logging

---

## 🚀 Deployment Considerations

### Production Settings

```typescript
// src/lib/azure.prod.ts
import { Configuration } from '@azure/msal-browser'

export const productionMsalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID}`,
    redirectUri: 'https://yourdomain.com/auth/callback',
    postLogoutRedirectUri: 'https://yourdomain.com'
  },
  cache: {
    cacheLocation: 'localStorage', // Use localStorage in production
    storeAuthStateInCookie: true   // Better for IE/Safari
  },
  system: {
    loggerOptions: {
      logLevel: 3, // Error level only
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        if (level <= 3) {
          console.error(message)
        }
      }
    }
  }
}
```

---

**🏢 Azure AD Integration Complete!**

Your 3ASYAPP template now supports both Supabase authentication for rapid development and Azure AD for enterprise environments.

**Professional Plan Azure Benefits:**
- ✅ **Custom Azure Setup** - Personalized Azure AD configuration
- ✅ **Multi-tenant Support** - Serve multiple organizations
- ✅ **Advanced Security** - Conditional access and compliance setup
- ✅ **Integration Support** - Help with existing Azure infrastructure
- ✅ **Migration Assistance** - Move from other auth systems

**Choose your authentication mode in .env and start building enterprise-ready applications!**

---

*Template curated by Michele Miky Monti – Entrepreneur & Technology Generalist (enterprise authentication made pragmatic)* 🏢
