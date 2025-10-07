// src/hooks/useAzureAuth.ts
import { useEffect, useState, useCallback } from 'react'
import { AuthenticationResult, AccountInfo } from '@azure/msal-browser'
import { msalInstance, loginRequest, tokenRequest } from '@/lib/azure'

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

  const getUserProfile = useCallback(async (account: AccountInfo) => {
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
      let groups: string[] = []
      try {
        const groupsResponse = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
          headers: {
            'Authorization': `Bearer ${response.accessToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (groupsResponse.ok) {
          const groupsData = await groupsResponse.json()
          groups = groupsData.value?.map((group: { displayName: string }) => group.displayName) || []
        }
      } catch (groupError) {
        console.warn('Could not fetch user groups:', groupError)
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
  }, [])

  const initializeAuth = useCallback(async () => {
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
  }, [getUserProfile])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

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
