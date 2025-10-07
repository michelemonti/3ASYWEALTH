# 🔐 Authentication System - Developer Guide

This template includes a **dual authentication system** that supports both Supabase and Azure AD authentication. This guide explains how to use it in your development.

## 🚀 Quick Start

### 1. Choose Authentication Mode

Set the authentication mode in your `.env` file:

```bash
# For startups and rapid development (default)
VITE_AUTH_MODE=supabase

# For enterprise customers with Azure AD
VITE_AUTH_MODE=azure
```

### 2. Configure Credentials

**For Supabase mode:**
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**For Azure mode:**
```bash
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_REDIRECT_URI=http://localhost:8080/auth/callback
```

## 🔧 Using Authentication in Components

### Basic Authentication Hook

```tsx
import { useAuth } from '@/hooks/useAuth'

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    loading, 
    login, 
    logout,
    authMode 
  } = useAuth()

  if (loading) return <div>Loading...</div>

  if (!isAuthenticated) {
    return (
      <button onClick={login}>
        Sign In {authMode === 'azure' ? 'with Microsoft' : 'with Email'}
      </button>
    )
  }

  return (
    <div>
      <p>Welcome, {user.name || user.email}!</p>
      <p>Authentication: {authMode}</p>
      <button onClick={logout}>Sign Out</button>
    </div>
  )
}
```

### Protected Routes

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Admin-only routes (Azure AD only) */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRoles={['Admin Users']}>
            <AdminPanel />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}
```

### Role-Based Access (Azure AD only)

```tsx
import { useAuth } from '@/hooks/useAuth'

function AdminFeature() {
  const { hasRole, getUserRoles } = useAuth()

  // Check specific role
  if (!hasRole('Admin Users')) {
    return <div>Access denied</div>
  }

  // Get all user roles
  const roles = getUserRoles()

  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Your roles: {roles.join(', ')}</p>
    </div>
  )
}
```

## 📱 UI Components

### Login Page

The template automatically shows the correct login form:

- **Supabase mode**: Email/password form
- **Azure mode**: Microsoft SSO button

```tsx
import { LoginPage } from '@/pages/LoginPage'

// This automatically shows the right login UI
<Route path="/login" element={<LoginPage />} />
```

### User Profile Display

```tsx
import { useAuth } from '@/hooks/useAuth'

function UserProfile() {
  const { user, authMode } = useAuth()

  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      
      {/* Azure-specific fields */}
      {authMode === 'azure' && (
        <>
          {user.jobTitle && <p>Title: {user.jobTitle}</p>}
          {user.department && <p>Department: {user.department}</p>}
          {user.officeLocation && <p>Office: {user.officeLocation}</p>}
        </>
      )}
    </div>
  )
}
```

## 🏢 Enterprise Features (Azure AD)

### Group-Based Permissions

Map Azure AD groups to application roles:

```tsx
// src/lib/azure/userSync.ts
export function mapAzureGroupsToRoles(groups: string[]): string[] {
  const roleMapping: Record<string, string> = {
    'Admin Users': 'admin',
    'Managers': 'manager', 
    'Department Heads': 'manager',
    'All Company': 'user'
  }

  return groups
    .map(group => roleMapping[group])
    .filter(Boolean)
}
```

### Conditional Features

```tsx
import { useAuth } from '@/hooks/useAuth'

function ConditionalFeature() {
  const { authMode, hasRole } = useAuth()

  return (
    <div>
      {/* Show for all authenticated users */}
      <UserDashboard />
      
      {/* Show only for Azure enterprise users */}
      {authMode === 'azure' && (
        <EnterpriseFeatures />
      )}
      
      {/* Show only for specific Azure roles */}
      {hasRole('Admin Users') && (
        <AdminControls />
      )}
    </div>
  )
}
```

## 🔧 Development Tips

### Environment Switching

You can easily switch between auth modes during development:

```bash
# Test with Supabase
VITE_AUTH_MODE=supabase npm run dev

# Test with Azure (need Azure setup)
VITE_AUTH_MODE=azure npm run dev
```

### Debug Authentication

```tsx
import { useAuth } from '@/hooks/useAuth'

function DebugAuth() {
  const auth = useAuth()
  
  return (
    <pre>
      {JSON.stringify({
        isAuthenticated: auth.isAuthenticated,
        authMode: auth.authMode,
        user: auth.user,
        roles: auth.getUserRoles()
      }, null, 2)}
    </pre>
  )
}
```

### Error Handling

```tsx
import { useAuth } from '@/hooks/useAuth'

function LoginButton() {
  const { login, error } = useAuth()
  
  const handleLogin = async () => {
    try {
      await login()
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  return (
    <div>
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      <button onClick={handleLogin}>
        Sign In
      </button>
    </div>
  )
}
```

## 📋 Testing Checklist

### Supabase Mode Testing
- [ ] User can sign up with email/password
- [ ] User can sign in with email/password
- [ ] User can sign out
- [ ] Protected routes work correctly
- [ ] User data is displayed correctly

### Azure Mode Testing
- [ ] User can sign in with Microsoft account
- [ ] Azure redirect flow works
- [ ] User profile data syncs from Microsoft Graph
- [ ] User groups/roles are retrieved
- [ ] Role-based access control works
- [ ] User can sign out

### General Testing
- [ ] Environment switching works
- [ ] Header shows correct auth status
- [ ] Dashboard displays user info
- [ ] Protected routes redirect to login
- [ ] Error states are handled gracefully

---

**🎯 Ready to use!** The authentication system is fully functional and enterprise-ready. Just choose your mode and start building!
