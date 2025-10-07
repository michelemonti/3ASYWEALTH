// src/lib/config.ts
export const AUTH_CONFIG = {
  mode: (import.meta.env.VITE_AUTH_MODE || 'supabase') as 'azure' | 'supabase',
  
  azure: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
    tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || '',
    enabled: Boolean(import.meta.env.VITE_AZURE_CLIENT_ID)
  },
  
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    enabled: Boolean(import.meta.env.VITE_SUPABASE_URL)
  }
}

export const isAzureMode = () => AUTH_CONFIG.mode === 'azure' && AUTH_CONFIG.azure.enabled
export const isSupabaseMode = () => AUTH_CONFIG.mode === 'supabase' && AUTH_CONFIG.supabase.enabled
export const isDemoModeEnabled = () => !(isAzureMode() || isSupabaseMode())

// Environment validation
export const validateEnvironment = () => {
  const errors: string[] = []
  
  if (AUTH_CONFIG.mode === 'azure') {
    if (!AUTH_CONFIG.azure.clientId) {
      errors.push('VITE_AZURE_CLIENT_ID is required for Azure authentication')
    }
    if (!AUTH_CONFIG.azure.tenantId) {
      errors.push('VITE_AZURE_TENANT_ID is required for Azure authentication')
    }
  }
  
  if (AUTH_CONFIG.mode === 'supabase') {
    if (!AUTH_CONFIG.supabase.url) {
      errors.push('VITE_SUPABASE_URL is required for Supabase authentication')
    }
    if (!AUTH_CONFIG.supabase.anonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required for Supabase authentication')
    }
  }
  
  return errors
}
