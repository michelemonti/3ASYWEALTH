# Customization Guide - 3ASYAPP Template

**Transform the template into your unique enterprise application**

## 🎨 Customization Philosophy

This template is designed to be highly customizable while maintaining enterprise-grade code quality. Every aspect can be tailored to your specific business needs, from branding and styling to functionality and integrations.

## 🎯 Getting Started with Customization

### 1. Define Your Brand Identity

Before diving into code, establish your brand guidelines:
- **Primary Colors**: Main brand colors (2-3 colors)
- **Typography**: Font families and hierarchies
- **Logo Assets**: SVG, PNG versions at different sizes
- **Voice & Tone**: How your brand communicates
- **User Experience**: Target audience and their needs

### 2. Plan Your Features

Map out what you need:
- **Core Features**: Essential functionality for your business
- **User Roles**: Different types of users and their permissions
- **Integrations**: Third-party services you need
- **Business Logic**: Unique rules and workflows
- **Monetization**: How you'll generate revenue

## 🎨 Visual Customization

### Color Scheme Customization

The template uses CSS custom properties for easy theming:

```css
/* src/index.css - Update these variables */
:root {
  /* Primary brand colors */
  --primary: 142 70% 45%;        /* Your main brand color */
  --primary-foreground: 210 40% 98%;
  
  /* Secondary colors */
  --secondary: 210 40% 96%;      /* Light accent color */
  --secondary-foreground: 222.2 84% 4.9%;
  
  /* Accent colors */
  --accent: 210 40% 96%;         /* Interactive elements */
  --accent-foreground: 222.2 84% 4.9%;
  
  /* Semantic colors */
  --success: 142 76% 36%;        /* Success states */
  --warning: 38 92% 50%;         /* Warning states */
  --danger: 0 84% 60%;           /* Error states */
  --info: 199 89% 48%;           /* Information states */
}

/* Dark mode colors */
.dark {
  --primary: 142 70% 45%;
  --primary-foreground: 210 40% 98%;
  /* ... customize dark mode palette */
}
```

### Advanced Color Customization

For complex branding needs:

```css
/* Custom color utilities */
:root {
  /* Brand gradient */
  --brand-gradient: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
  
  /* Custom shadows with brand colors */
  --brand-shadow: 0 4px 14px 0 hsla(var(--primary), 0.15);
  --brand-shadow-lg: 0 10px 25px -3px hsla(var(--primary), 0.2);
  
  /* Interactive states */
  --primary-hover: 142 70% 38%;  /* Darker primary for hover */
  --primary-active: 142 70% 35%; /* Even darker for active */
}
```

### Typography Customization

Update font families and typography scale:

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Font families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --font-serif: 'Playfair Display', Georgia, serif;
  
  /* Font sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
}

/* Apply fonts */
body {
  font-family: var(--font-sans);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-sans);
  font-weight: 600;
}

code, pre {
  font-family: var(--font-mono);
}
```

### Logo and Brand Assets

Replace template assets with your branding:

```typescript
// src/components/ui/Logo.tsx
import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'light' | 'dark'
  className?: string
}

export function Logo({ size = 'md', variant = 'light', className }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-12 w-auto'
  }
  
  return (
    <img
      src={variant === 'light' ? '/logo-light.svg' : '/logo-dark.svg'}
      alt="Your Company Name"
      className={`${sizeClasses[size]} ${className}`}
    />
  )
}

// Alternative: SVG Logo Component
export function LogoSVG({ size = 'md', className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 40"
      className={`${sizeClasses[size]} ${className}`}
      fill="currentColor"
    >
      {/* Your SVG logo paths */}
      <path d="M10 10h80v20H10z" />
    </svg>
  )
}
```

## 🏗️ Structural Customization

### Navigation Customization

Modify the navigation to match your app structure:

```typescript
// src/components/Header.tsx
import { Logo } from '@/components/ui/Logo'
import { Navigation } from '@/components/ui/Navigation'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
  { name: 'Analytics', href: '/analytics', icon: 'chart' },
  { name: 'Settings', href: '/settings', icon: 'settings' },
  // Add your menu items
]

export function Header() {
  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Logo size="md" />
          <Navigation items={navigationItems} />
        </div>
      </div>
    </header>
  )
}
```

### Layout Customization

Create custom layouts for different sections:

```typescript
// src/layouts/DashboardLayout.tsx
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Footer } from '@/components/Footer'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
```

## 🔧 Functional Customization

### Custom Hooks

Create hooks specific to your business logic:

```typescript
// src/hooks/useYourBusinessLogic.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useYourBusinessLogic() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('your_table')
          .select('*')
        
        if (error) throw error
        setData(data)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading, error }
}
```

### Custom Components

Build components specific to your industry:

```typescript
// src/components/custom/YourIndustryComponent.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface YourIndustryComponentProps {
  data: any[]
  onAction: (item: any) => void
}

export function YourIndustryComponent({ data, onAction }: YourIndustryComponentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>{item.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{item.description}</p>
            <Button 
              onClick={() => onAction(item)}
              className="w-full"
            >
              Take Action
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

## 🗄️ Database Customization

### Custom Tables

Add tables specific to your business:

```sql
-- Custom business tables
CREATE TABLE your_business_entities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    metadata JSONB DEFAULT '{}',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE your_business_entities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own entities" ON your_business_entities
    FOR ALL USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX idx_business_entities_owner ON your_business_entities(owner_id);
CREATE INDEX idx_business_entities_category ON your_business_entities(category);
```

### Custom Types

Define TypeScript types for your data:

```typescript
// src/types/business.ts
export interface YourBusinessEntity {
  id: string
  name: string
  description?: string
  category: string
  metadata: Record<string, any>
  owner_id: string
  created_at: string
  updated_at: string
}

export type CreateBusinessEntity = Omit<YourBusinessEntity, 'id' | 'created_at' | 'updated_at'>
export type UpdateBusinessEntity = Partial<CreateBusinessEntity>
```

## 🔐 Authentication Customization

### Custom User Profile

Extend user profiles with business-specific fields:

```sql
-- Extend profiles table
ALTER TABLE profiles ADD COLUMN company TEXT;
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
```

### Custom Authentication Flow

```typescript
// src/hooks/useCustomAuth.ts
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'

export function useCustomAuth() {
  const { user } = useAuth()

  const signUpWithProfile = async (email: string, password: string, profileData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileData // Additional profile data
      }
    })

    if (error) throw error

    // Create custom profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          ...profileData
        })

      if (profileError) throw profileError
    }

    return data
  }

  return {
    user,
    signUpWithProfile
  }
}
```

## 💳 Payment Customization

### Custom Pricing Plans

Define your pricing structure:

```typescript
// src/config/pricing.ts
export const PRICING_PLANS = {
  free: {
    id: 'free',
    name: 'Starter',
    description: 'Perfect for getting started',
    price: 0,
    interval: 'month',
    features: [
      'Up to 100 records',
      'Basic support',
      'Standard features'
    ],
    limits: {
      records: 100,
      users: 1,
      storage: '1GB'
    }
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'For growing businesses',
    price: 99, // Example price point
    interval: 'month',
    features: [
      'Unlimited records',
      'Priority support',
      'Advanced features',
      'API access',
      'Custom integrations'
    ],
    limits: {
      records: -1, // Unlimited
      users: 10,
      storage: '100GB'
    },
    stripe_price_id: 'price_professional_monthly'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: 199,
    interval: 'month',
    features: [
      'Everything in Professional',
      'Dedicated support',
      'Custom deployment',
      'SLA guarantee'
    ],
    stripe_price_id: 'price_enterprise_monthly'
  }
}
```

### Custom Payment Flow

```typescript
// src/hooks/useCustomPayment.ts
import { loadStripe } from '@stripe/stripe-js'
import { supabase } from '@/lib/supabase'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)

export function useCustomPayment() {
  const createSubscription = async (priceId: string, customerId?: string) => {
    const { data, error } = await supabase.functions.invoke('create-subscription', {
      body: {
        price_id: priceId,
        customer_id: customerId,
        // Add custom metadata
        metadata: {
          source: 'webapp',
          plan_type: 'professional'
        }
      }
    })

    if (error) throw error

    const stripe = await stripePromise
    return stripe?.redirectToCheckout({ sessionId: data.session_id })
  }

  return {
    createSubscription
  }
}
```

## 🔗 Integration Customization

### Custom API Integration

Add integrations specific to your industry:

```typescript
// src/integrations/customAPI.ts
class CustomAPIIntegration {
  private apiKey: string
  private baseUrl: string

  constructor() {
    this.apiKey = import.meta.env.VITE_CUSTOM_API_KEY
    this.baseUrl = 'https://api.yourcustomservice.com/v1'
  }

  async fetchData(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value.toString())
      })
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    return response.json()
  }

  async syncData() {
    // Custom synchronization logic
    const data = await this.fetchData('/sync')
    
    // Store in Supabase
    const { error } = await supabase
      .from('synced_data')
      .upsert(data)

    if (error) throw error
    return data
  }
}

export const customAPI = new CustomAPIIntegration()
```

### Webhook Handlers

Create custom webhook endpoints for integrations:

```typescript
// supabase/functions/custom-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  try {
    const payload = await req.json()
    
    // Verify webhook signature if needed
    const signature = req.headers.get('x-webhook-signature')
    if (!verifySignature(payload, signature)) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Process webhook data
    const { error } = await supabase
      .from('webhook_events')
      .insert({
        source: 'custom-service',
        event_type: payload.type,
        data: payload.data
      })

    if (error) throw error

    return new Response('OK', { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function verifySignature(payload: any, signature: string): boolean {
  // Implement signature verification logic
  return true
}
```

## 🧪 Testing Customization

### Custom Test Utilities

Create testing utilities for your specific components:

```typescript
// src/test/custom-utils.tsx
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/components/AuthProvider'

// Custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Custom test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: new Date().toISOString(),
  ...overrides
})

export const createMockBusinessEntity = (overrides = {}) => ({
  id: 'entity-1',
  name: 'Test Entity',
  description: 'A test entity',
  category: 'test',
  owner_id: 'user-1',
  created_at: new Date().toISOString(),
  ...overrides
})
```

## 📱 Mobile Customization

### Responsive Design

Customize mobile experience:

```css
/* Mobile-first responsive utilities */
.mobile-nav {
  @apply fixed bottom-0 left-0 right-0 bg-background border-t border-border;
  @apply flex justify-around items-center h-16 px-4;
  @apply lg:hidden; /* Hide on desktop */
}

.desktop-nav {
  @apply hidden lg:flex; /* Show only on desktop */
}

/* Custom mobile breakpoints */
@media (max-width: 640px) {
  .mobile-stack {
    @apply flex-col space-y-4 space-x-0;
  }
  
  .mobile-full {
    @apply w-full;
  }
}
```

### Mobile-Specific Components

```typescript
// src/components/mobile/MobileNavigation.tsx
import { Home, Search, User, Settings } from 'lucide-react'

const mobileNavItems = [
  { name: 'Home', icon: Home, href: '/' },
  { name: 'Search', icon: Search, href: '/search' },
  { name: 'Profile', icon: User, href: '/profile' },
  { name: 'Settings', icon: Settings, href: '/settings' }
]

export function MobileNavigation() {
  return (
    <nav className="mobile-nav">
      {mobileNavItems.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="flex flex-col items-center justify-center space-y-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <item.icon className="h-5 w-5" />
          <span className="text-xs">{item.name}</span>
        </a>
      ))}
    </nav>
  )
}
```

## 🔍 SEO Customization

### Custom Meta Tags

```typescript
// src/components/SEOHead.tsx
import { Helmet } from 'react-helmet-async'

interface SEOHeadProps {
  title: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'product'
}

export function SEOHead({
  title,
  description = 'Your custom app description',
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website'
}: SEOHeadProps) {
  const fullTitle = `${title} | Your App Name`
  const currentUrl = url || window.location.href

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      
      {/* OpenGraph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={currentUrl} />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Your App Name",
          "description": description,
          "url": currentUrl,
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web"
        })}
      </script>
    </Helmet>
  )
}
```

## 📊 Analytics Customization

### Custom Event Tracking

```typescript
// src/lib/analytics.ts
interface AnalyticsEvent {
  name: string
  properties?: Record<string, any>
  userId?: string
}

class CustomAnalytics {
  private gtag: any

  constructor() {
    this.gtag = (window as any).gtag
  }

  track(event: AnalyticsEvent) {
    // Google Analytics
    if (this.gtag) {
      this.gtag('event', event.name, {
        ...event.properties,
        user_id: event.userId
      })
    }

    // Custom analytics endpoint
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(event)
    }).catch(console.error)
  }

  // Business-specific events
  trackBusinessAction(action: string, entityType: string, entityId: string) {
    this.track({
      name: 'business_action',
      properties: {
        action,
        entity_type: entityType,
        entity_id: entityId
      }
    })
  }

  trackUserJourney(step: string, metadata?: Record<string, any>) {
    this.track({
      name: 'user_journey',
      properties: {
        step,
        ...metadata
      }
    })
  }
}

export const analytics = new CustomAnalytics()
```

## 🚀 Performance Customization

### Code Splitting for Your Features

```typescript
// src/pages/index.ts - Lazy load your custom pages
import { lazy } from 'react'

export const Dashboard = lazy(() => import('./Dashboard'))
export const YourCustomFeature = lazy(() => import('./YourCustomFeature'))
export const Analytics = lazy(() => import('./Analytics'))

// Pre-load critical routes
export const HomePage = lazy(() => 
  import('./HomePage').then(module => ({
    default: module.HomePage
  }))
)
```

### Custom Performance Monitoring

```typescript
// src/lib/performance.ts
export class PerformanceMonitor {
  static measureCustomOperation<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      const start = performance.now()
      
      try {
        const result = await operation()
        const duration = performance.now() - start
        
        // Log to custom analytics
        analytics.track({
          name: 'performance_metric',
          properties: {
            operation: name,
            duration,
            status: 'success'
          }
        })
        
        resolve(result)
      } catch (error) {
        const duration = performance.now() - start
        
        analytics.track({
          name: 'performance_metric',
          properties: {
            operation: name,
            duration,
            status: 'error',
            error: error.message
          }
        })
        
        reject(error)
      }
    })
  }
}
```

## 🛠️ Development Tools Customization

### Custom CLI Commands

```json
// package.json - Add custom scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest",
    "generate:component": "node scripts/generate-component.js",
    "generate:page": "node scripts/generate-page.js",
    "setup:business": "node scripts/setup-business-logic.js",
    "db:migrate": "node scripts/db-migrate.js",
    "deploy:staging": "node scripts/deploy-staging.js"
  }
}
```

Create custom generators:

```javascript
// scripts/generate-component.js
const fs = require('fs')
const path = require('path')

const componentName = process.argv[2]
if (!componentName) {
  console.error('Please provide a component name')
  process.exit(1)
}

const template = `import React from 'react'

interface ${componentName}Props {
  // Define your props here
}

export function ${componentName}({}: ${componentName}Props) {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">${componentName}</h2>
      {/* Your component content */}
    </div>
  )
}
`

const componentPath = path.join('src/components', `${componentName}.tsx`)
fs.writeFileSync(componentPath, template)

console.log(`✅ Created ${componentName} component at ${componentPath}`)
```

## 📋 Customization Checklist

### Pre-Customization
- [ ] Define brand guidelines and color palette
- [ ] Plan feature requirements and user flows
- [ ] Set up development environment
- [ ] Create customization branch in git

### Visual Customization
- [ ] Update color scheme in CSS variables
- [ ] Replace logo and brand assets
- [ ] Customize typography and fonts
- [ ] Update favicon and app icons
- [ ] Customize component styling

### Functional Customization
- [ ] Create custom database tables
- [ ] Implement business-specific logic
- [ ] Add custom API integrations
- [ ] Create custom components and hooks
- [ ] Set up custom authentication flow

### Content Customization
- [ ] Update all text content and copy
- [ ] Create custom error messages
- [ ] Add your terms of service and privacy policy
- [ ] Update meta tags and SEO content
- [ ] Create custom help documentation

### Technical Customization
- [ ] Configure environment variables
- [ ] Set up custom analytics
- [ ] Implement custom monitoring
- [ ] Add business-specific tests
- [ ] Configure CI/CD for your needs

### Post-Customization
- [ ] Test all customized features
- [ ] Update documentation
- [ ] Deploy to staging environment
- [ ] Conduct user acceptance testing
- [ ] Deploy to production

---

**🎉 Congratulations!** You've successfully customized your enterprise webapp!

**Need customization help?** Professional Plan includes:
- Custom development assistance
- Design and branding consultation
- Integration development
- Performance optimization
- Priority support for customizations

---

*Template curated by Michele Miky Monti – Practical customization patterns* 🎨
