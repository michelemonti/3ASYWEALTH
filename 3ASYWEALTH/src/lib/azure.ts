// src/lib/azure.ts
import { Configuration, PublicClientApplication, AccountInfo } from '@azure/msal-browser'

// Azure AD configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
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
        if (import.meta.env.DEV) {
          console.log(message)
        }
      }
    }
  }
}

// Login request configuration
export const loginRequest = {
  scopes: ['User.Read', 'email', 'profile', 'openid'],
  prompt: 'select_account' as const
}

// Token request for API calls
export const tokenRequest = {
  scopes: ['User.Read'],
  account: null as AccountInfo | null
}

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig)

// Initialize MSAL
export async function loginWithAzure(msalInstance: PublicClientApplication) {
  try {
    const response = await msalInstance.loginPopup(loginRequest)
    return response
  } catch (error) {
    console.error('Azure AD login failed:', error)
    throw error
  }
}

// Check if Azure mode is enabled
export const isAzureModeEnabled = () => {
  const authMode = import.meta.env.VITE_AUTH_MODE || 'supabase'
  const hasAzureConfig = Boolean(import.meta.env.VITE_AZURE_CLIENT_ID)
  return authMode === 'azure' && hasAzureConfig
}
