/**
 * 📝 Type Definitions for 3ASYAPP Template
 * 
 * Comprehensive TypeScript types for the entire application.
 * 
 * @author Michele Miky Monti
 * @version 2.0 - Claude 4.5 Upgrade
 */

// =============================================================================
// 👤 USER & AUTHENTICATION TYPES
// =============================================================================

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  role: UserRole
  created_at: Date
  updated_at: Date
  metadata?: Record<string, unknown>
}

export type UserRole = 'admin' | 'user' | 'guest'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
}

export interface AuthError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string
}

// =============================================================================
// 🌐 API TYPES
// =============================================================================

export type ApiResponse<T> = 
  | { success: true; data: T; meta?: ApiMeta }
  | { success: false; error: ApiError }

export interface ApiError {
  code: string
  message: string
  status: number
  details?: Record<string, unknown>
}

export interface ApiMeta {
  page?: number
  pageSize?: number
  total?: number
  hasMore?: boolean
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// =============================================================================
// 📊 DATABASE TYPES
// =============================================================================

export interface DatabaseRow {
  id: string
  created_at: Date
  updated_at: Date
}

export interface Profile extends DatabaseRow {
  user_id: string
  username?: string
  bio?: string
  avatar_url?: string
}

export interface Post extends DatabaseRow {
  user_id: string
  title: string
  content: string
  published: boolean
  view_count: number
}

// =============================================================================
// ⛓️ BLOCKCHAIN TYPES
// =============================================================================

export interface WalletState {
  address: string | null
  isConnected: boolean
  balance: string
  chainId: number
  provider: unknown | null
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
}

export interface SmartContract {
  address: string
  abi: unknown[]
  chainId: number
}

// =============================================================================
// 🤖 AI TYPES
// =============================================================================

export interface AIRequest {
  prompt: string
  model?: 'gpt-4' | 'gpt-3.5-turbo'
  temperature?: number
  maxTokens?: number
}

export interface AIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

// =============================================================================
// 💳 PAYMENT TYPES
// =============================================================================

export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed'
  clientSecret?: string
}

export interface Subscription {
  id: string
  userId: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'canceled' | 'past_due'
  currentPeriodEnd: Date
}

// =============================================================================
// 🎨 UI COMPONENT TYPES
// =============================================================================

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

export interface InputProps extends BaseComponentProps {
  type?: string
  placeholder?: string
  value?: string
  error?: string
  disabled?: boolean
  onChange?: (value: string) => void
}

// =============================================================================
// 🎯 FORM TYPES
// =============================================================================

export interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

export interface FormFieldProps<T> {
  name: keyof T
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

// =============================================================================
// 🔍 UTILITY TYPES
// =============================================================================

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined

export type AsyncFunction<T = void> = () => Promise<T>
export type VoidFunction = () => void

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

// =============================================================================
// 📦 STORE TYPES (for Zustand)
// =============================================================================

export type StoreState = Record<string, never> // Placeholder for global state - extend as needed

export type StoreActions = Record<string, never> // Placeholder for global actions - extend as needed

export type Store = StoreState & StoreActions

// =============================================================================
// 🎣 HOOK RETURN TYPES
// =============================================================================

export interface UseQueryResult<T> {
  data: T | undefined
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  isLoading: boolean
  isError: boolean
  error: Error | null
  data: TData | undefined
}

// =============================================================================
// 🌍 ENVIRONMENT TYPES
// =============================================================================

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string
    readonly VITE_SUPABASE_ANON_KEY?: string
    readonly VITE_AUTH_MODE?: 'supabase' | 'azure'
    readonly VITE_AZURE_CLIENT_ID?: string
    readonly VITE_AZURE_TENANT_ID?: string
    readonly VITE_AZURE_REDIRECT_URI?: string
    readonly VITE_CONTRACT_ADDRESS?: string
    readonly VITE_NETWORK_CHAIN_ID?: string
    readonly VITE_OPENAI_API_KEY?: string
    readonly VITE_STRIPE_PUBLISHABLE_KEY?: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
