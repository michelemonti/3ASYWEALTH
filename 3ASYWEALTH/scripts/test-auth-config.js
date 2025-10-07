// scripts/test-auth-config.js
/**
 * Test script to verify authentication configuration
 * Run with: npm run test:auth
 */

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const dotenv = require('dotenv')

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') })

console.log('🔐 3ASYAPP Authentication Configuration Test\n')

const authMode = process.env.VITE_AUTH_MODE || 'supabase'
console.log(`📋 Authentication Mode: ${authMode.toUpperCase()}`)

if (authMode === 'azure') {
  console.log('\n🏢 Azure AD Configuration:')
  console.log(`   Client ID: ${process.env.VITE_AZURE_CLIENT_ID ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Tenant ID: ${process.env.VITE_AZURE_TENANT_ID ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Redirect URI: ${process.env.VITE_AZURE_REDIRECT_URI || 'Using default'}`)
  
  if (!process.env.VITE_AZURE_CLIENT_ID || !process.env.VITE_AZURE_TENANT_ID) {
    console.log('\n❌ Azure mode requires VITE_AZURE_CLIENT_ID and VITE_AZURE_TENANT_ID')
    console.log('   See docs/AZURE_AD_INTEGRATION.md for setup instructions')
  } else {
    console.log('\n✅ Azure AD configuration looks good!')
  }
} else if (authMode === 'supabase') {
  console.log('\n🗄️  Supabase Configuration:')
  console.log(`   URL: ${process.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`)
  console.log(`   Anon Key: ${process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`)
  
  if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    console.log('\n❌ Supabase mode requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
    console.log('   See docs/DATABASE_SETUP.md for setup instructions')
  } else {
    console.log('\n✅ Supabase configuration looks good!')
  }
} else {
  console.log(`\n❌ Invalid auth mode: ${authMode}`)
  console.log('   Valid options: "supabase" or "azure"')
}

console.log('\n🔧 Optional Features:')
console.log(`   Stripe Payments: ${process.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅ Configured' : '⚪ Not configured'}`)
console.log(`   Blockchain: ${process.env.VITE_CONTRACT_ADDRESS ? '✅ Configured' : '⚪ Not configured'}`)
console.log(`   AI Features: ${process.env.VITE_OPENAI_API_KEY ? '✅ Configured' : '⚪ Not configured'}`)

console.log('\n🚀 Next Steps:')
if (authMode === 'supabase' && (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY)) {
  console.log('   1. Set up Supabase project: https://supabase.com')
  console.log('   2. Copy .env.example to .env')
  console.log('   3. Add your Supabase credentials')
  console.log('   4. Run: npm run dev')
} else if (authMode === 'azure' && (!process.env.VITE_AZURE_CLIENT_ID || !process.env.VITE_AZURE_TENANT_ID)) {
  console.log('   1. Create Azure App Registration')
  console.log('   2. Copy .env.example to .env')  
  console.log('   3. Add your Azure credentials')
  console.log('   4. Run: npm run dev')
} else {
  console.log('   1. Run: npm run dev')
  console.log('   2. Visit: http://localhost:8080')
  console.log('   3. Test authentication flow')
}

console.log('\n📚 Documentation:')
console.log('   • Complete Setup: docs/SETUP_GUIDE.md')
console.log('   • Database Setup: docs/DATABASE_SETUP.md')  
console.log('   • Azure AD Setup: docs/AZURE_AD_INTEGRATION.md')
console.log('   • Auth Usage: AUTHENTICATION_GUIDE.md')

console.log('\n✨ Happy coding!\n')
