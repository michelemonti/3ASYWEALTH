/**
 * Environment Configuration with Runtime Validation
 * 
 * Uses Zod for type-safe environment variables with validation.
 * Fails fast on startup if required env vars are missing.
 * 
 * @author Michele Miky Monti
 * @version 2.0 - Claude 4.5 Upgrade
 */

import { z } from 'zod'

// Environment Schema Definition
const envSchema = z.object({
  // Supabase Configuration (Required for core features)
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  
  // Authentication Mode
  VITE_AUTH_MODE: z.enum(['supabase', 'azure']).default('supabase'),
  
  // Azure AD Configuration (Optional - Enterprise)
  VITE_AZURE_CLIENT_ID: z.string().uuid().optional(),
  VITE_AZURE_TENANT_ID: z.string().uuid().optional(),
  VITE_AZURE_REDIRECT_URI: z.string().url().optional(),
  
  // Blockchain Configuration (Optional)
  VITE_CONTRACT_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  VITE_NETWORK_CHAIN_ID: z.coerce.number().int().positive().optional(),
  VITE_INFURA_PROJECT_ID: z.string().optional(),
  
  // AI Integration (Optional)
  VITE_OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  
  // Payment Integration (Optional)
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  
  // Application Environment
  MODE: z.enum(['development', 'staging', 'production']).default('development'),
  DEV: z.boolean().default(false),
  PROD: z.boolean().default(false),
})

// Infer TypeScript type from Zod schema
export type Env = z.infer<typeof envSchema>

/**
 * Parse and Validate Environment Variables
 * 
 * Throws descriptive error if validation fails.
 * Only runs once at module load time.
 */
function parseEnv(): Env {
  try {
    return envSchema.parse({
      ...import.meta.env,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `  ERROR: ${err.path.join('.')}: ${err.message}`
      ).join('\n')
      
      throw new Error(
        `\nEnvironment Configuration Error:\n\n${errors}\n\n` +
        `Check your .env file and ensure all required variables are set.\n` +
        `See docs/SETUP_GUIDE.md for details.\n`
      )
    }
    throw error
  }
}

/**
 * Validated Environment Configuration
 * 
 * Use this instead of import.meta.env for type safety and validation.
 */
export const env = parseEnv()

/**
 * Environment Helpers
 */
export const isDevelopment = env.MODE === 'development'
export const isStaging = env.MODE === 'staging'
export const isProduction = env.MODE === 'production'

/**
 * Feature Flags based on Configuration
 */
export const features = {
  supabase: !!(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY),
  azure: env.VITE_AUTH_MODE === 'azure' && !!(env.VITE_AZURE_CLIENT_ID && env.VITE_AZURE_TENANT_ID),
  blockchain: !!env.VITE_CONTRACT_ADDRESS,
  ai: !!env.VITE_OPENAI_API_KEY,
  payments: !!env.VITE_STRIPE_PUBLISHABLE_KEY,
} as const

/**
 * Production Validation
 */
if (isProduction) {
  if (!features.supabase && !features.azure) {
    throw new Error('Production requires either Supabase or Azure AD configuration')
  }
}
