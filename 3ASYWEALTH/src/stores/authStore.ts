/**
 * 🔐 Authentication Store (Zustand)
 * 
 * Global state management for authentication.
 * Persists auth state across page reloads.
 * 
 * @author Michele Miky Monti
 * @version 2.0 - Claude 4.5 Upgrade
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { supabase } from '../integrations/supabase/client'
import type { User, LoginCredentials, RegisterCredentials } from '../types'

// =============================================================================
// 🔧 STORE INTERFACE
// =============================================================================

interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
  setUser: (user: User | null) => void
}

// =============================================================================
// 🎯 STORE IMPLEMENTATION
// =============================================================================

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // ====== INITIAL STATE ======
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        // ====== ACTIONS ======

        /**
         * 🔑 Login with email and password
         */
        login: async (credentials) => {
          set({ isLoading: true, error: null })

          try {
            if (!supabase) {
              throw new Error('Supabase client not initialized')
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email: credentials.email,
              password: credentials.password,
            })

            if (error) throw error

            if (data.user) {
              const user: User = {
                id: data.user.id,
                email: data.user.email!,
                name: data.user.user_metadata?.name,
                avatar: data.user.user_metadata?.avatar,
                role: data.user.user_metadata?.role || 'user',
                created_at: new Date(data.user.created_at),
                updated_at: new Date(data.user.updated_at || data.user.created_at),
              }

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            }
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Login failed',
            })
            throw error
          }
        },

        /**
         * 📝 Register new user
         */
        register: async (credentials) => {
          set({ isLoading: true, error: null })

          try {
            if (!supabase) {
              throw new Error('Supabase client not initialized')
            }

            const { data, error } = await supabase.auth.signUp({
              email: credentials.email,
              password: credentials.password,
              options: {
                data: {
                  name: credentials.name,
                },
              },
            })

            if (error) throw error

            if (data.user) {
              const user: User = {
                id: data.user.id,
                email: data.user.email!,
                name: credentials.name,
                role: 'user',
                created_at: new Date(data.user.created_at),
                updated_at: new Date(data.user.updated_at || data.user.created_at),
              }

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
            }
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Registration failed',
            })
            throw error
          }
        },

        /**
         * 🚪 Logout user
         */
        logout: async () => {
          set({ isLoading: true, error: null })

          try {
            if (supabase) {
              const { error } = await supabase.auth.signOut()
              if (error) throw error
            }

            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            })
          } catch (error) {
            set({
              isLoading: false,
              error: error instanceof Error ? error.message : 'Logout failed',
            })
            throw error
          }
        },

        /**
         * ✅ Check authentication status
         */
        checkAuth: async () => {
          set({ isLoading: true })

          try {
            if (!supabase) {
              set({ isLoading: false })
              return
            }

            const { data, error } = await supabase.auth.getUser()

            if (error || !data.user) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
              })
              return
            }

            const user: User = {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.name,
              avatar: data.user.user_metadata?.avatar,
              role: data.user.user_metadata?.role || 'user',
              created_at: new Date(data.user.created_at),
              updated_at: new Date(data.user.updated_at || data.user.created_at),
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            })
          } catch (error) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Auth check failed',
            })
          }
        },

        /**
         * 🧹 Clear error message
         */
        clearError: () => {
          set({ error: null })
        },

        /**
         * 👤 Set user manually (for external auth providers)
         */
        setUser: (user) => {
          set({
            user,
            isAuthenticated: !!user,
          })
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'AuthStore',
      enabled: import.meta.env.DEV,
    }
  )
)

// =============================================================================
// 🎣 CONVENIENCE SELECTORS
// =============================================================================

export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error)
