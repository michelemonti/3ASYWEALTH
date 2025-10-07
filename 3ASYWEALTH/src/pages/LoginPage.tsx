// src/pages/LoginPage.tsx
import React from 'react'
import { AzureLogin } from '@/components/auth/AzureLogin'
import { SupabaseLogin } from '@/components/auth/SupabaseLogin'
// Replace old config helper with the new azure helper
import { isAzureModeEnabled } from '@/lib/azure'

export function LoginPage() {
  // Automatically choose the right login component based on configuration
  if (isAzureModeEnabled()) {
    return <AzureLogin />
  }
  
  return <SupabaseLogin />
}
