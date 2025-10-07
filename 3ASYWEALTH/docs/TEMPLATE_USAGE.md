# 📘 Template Usage Guide

**Complete guide on how to use the 3ASYAPP Template for your projects**

---

## 🎯 Overview

The 3ASYAPP Template is designed to be forked, copied, and customized for your specific needs. This guide explains the different approaches and best practices for starting a new project.

---

## 🚀 Three Ways to Start

### **1. Fork on GitHub**

**Best for:** Projects that want to stay connected with template updates

**Advantages:**
- ✅ Easy to pull future template improvements
- ✅ Keep template reference in your repository network
- ✅ Maintain connection with upstream changes
- ✅ GitHub automatically creates a copy

**Step-by-Step:**

```bash
# Step 1: Fork on GitHub
# Go to: https://github.com/michelemonti/3ASYAPPS
# Click: Fork button (top right)
# Choose: Your account/organization

# Step 2: Clone your fork
git clone https://github.com/YOUR-USERNAME/3ASYAPPS.git
cd 3ASYAPPS

# Step 3: Navigate to template
cd "3ASYAPP - TEMPLATE"

# Step 4: Install dependencies
npm install

# Step 5: Create environment file
cp .env.example .env
# Edit .env with your actual credentials

# Step 6: Start development
npm run dev
```

**Keeping Up with Updates:**
```bash
# Add original repository as upstream
git remote add upstream https://github.com/michelemonti/3ASYAPPS.git

# Fetch latest changes
git fetch upstream

# Merge updates (careful with conflicts!)
git merge upstream/main

# Or cherry-pick specific commits
git cherry-pick <commit-hash>
```

---

### **2. Copy as Subfolder**

**Best for:** Working with multiple projects locally, monorepo setups

**Advantages:**
- ✅ Complete independence from original template
- ✅ Multiple projects in one repository
- ✅ Easy local management
- ✅ No GitHub fork clutter

**Step-by-Step:**

```bash
# Step 1: Clone the original repository
git clone https://github.com/michelemonti/3ASYAPPS.git
cd 3ASYAPPS

# Step 2: Copy template folder with new name
cp -r "3ASYAPP - TEMPLATE" "my-awesome-app"
cd my-awesome-app

# Step 3: (Optional) Remove git history for fresh start
rm -rf .git
git init

# Step 4: Initialize as new repository
git add .
git commit -m "feat: initial commit from 3ASYAPP template"

# Step 5: (Optional) Connect to your remote repository
git remote add origin https://github.com/YOUR-USERNAME/my-awesome-app.git
git branch -M main
git push -u origin main

# Step 6: Install dependencies
npm install

# Step 7: Configure environment
cp .env.example .env
nano .env  # or use your favorite editor

# Step 8: Start developing
npm run dev
```

**Project Structure (Monorepo Example):**
```
my-workspace/
├── 3ASYAPP - TEMPLATE/      # Original template (reference)
├── client-project-1/         # First client project
├── client-project-2/         # Second client project
├── internal-tool/            # Internal tool
└── saas-product/            # SaaS application
```

---

### **3. AI-Assisted Setup**

**Best for:** Rapid development, complex customization requirements

**Advantages:**
- ✅ Fastest setup method
- ✅ Automatic customization
- ✅ AI handles configuration
- ✅ Immediate feature implementation
- ✅ Personalized to your needs

**Step-by-Step:**

#### **A. Setup with Claude (Recommended)**

```bash
# Step 1: Create project directory
mkdir my-new-app
cd my-new-app

# Step 2: Open in your IDE
code .  # VS Code
# or
cursor .  # Cursor IDE

# Step 3: Start conversation with AI
```

**Comprehensive AI Prompt Template:**

```markdown
I want to create a new application using the 3ASYAPP template 
from ../3ASYAPPS/3ASYAPP - TEMPLATE

PROJECT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: [Your Application Name]
Type: [SaaS / E-commerce / Dashboard / Portfolio / Other]
Purpose: [Brief description of what your app does]

TARGET AUDIENCE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Describe your target users]

CORE FEATURES NEEDED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [ ] User Authentication (Supabase/Azure AD/Both)
- [ ] User Dashboard
- [ ] Admin Panel
- [ ] Payment Processing (Stripe)
- [ ] AI Integration (OpenAI)
- [ ] Blockchain Features
- [ ] Real-time Updates
- [ ] File Upload
- [ ] Email Notifications
- [ ] Other: [Specify]

FEATURES TO REMOVE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [ ] Blockchain integration (not needed)
- [ ] Azure AD (using only Supabase)
- [ ] AI features
- [ ] Other: [Specify]

BRANDING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Color: [#hex or color name]
Secondary Color: [#hex or color name]
Brand Style: [Modern / Professional / Playful / Minimal]

INITIAL PAGES NEEDED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Landing page with [specific sections]
2. Authentication (Login/Signup)
3. User Dashboard with [features]
4. [Add more as needed]

SETUP TASKS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please:
1. Copy the template to this directory
2. Set up environment configuration
3. Customize branding (colors, name, logo placeholders)
4. Remove unused features
5. Create initial page structure
6. Set up database schema (if needed)
7. Create a development roadmap
8. List next steps for implementation

Then let's start building the core features!
```

#### **B. Real-World Example Prompts**

**Example 1: Simple Portfolio**
```
Create a portfolio website using the 3ASYAPP template.

Project: Personal Portfolio
Purpose: Showcase my development work
Features needed:
- Home page with introduction
- Projects showcase with filtering
- Contact form (no auth needed)
- Blog section

Remove:
- Authentication system
- Dashboard
- Payment processing
- Blockchain features
- Azure AD

Branding:
- Primary: #2563eb (blue)
- Style: Minimal and professional

Please set this up and create the initial page layouts.
```

**Example 2: SaaS Application**
```
Build a SaaS application using the 3ASYAPP template.

Project: TaskFlow Pro
Purpose: Team task management with AI suggestions
Type: SaaS subscription model

Features needed:
- Supabase authentication
- User dashboard with task lists
- Team collaboration
- AI-powered task suggestions (OpenAI)
- Stripe subscription billing
- Real-time updates

Remove:
- Azure AD integration
- Blockchain features

Branding:
- Primary: #10b981 (green)
- Secondary: #3b82f6 (blue)
- Style: Modern and clean

Database schema needed:
- Users table
- Teams table
- Tasks table
- Subscriptions table

Please set up the project, create the database schema, 
and implement the basic task management UI.
```

**Example 3: E-commerce Platform**
```
Create an e-commerce platform using 3ASYAPP template.

Project: Artisan Marketplace
Purpose: Sell handmade crafts online

Features needed:
- Product catalog with categories
- Shopping cart
- Stripe payment processing
- User accounts (buyers and sellers)
- Order management
- Admin dashboard

Remove:
- Azure AD
- Blockchain
- AI features

Additional requirements:
- Product image galleries
- Search and filter
- Seller profiles
- Order tracking

Please set up the project structure and create the 
product catalog and shopping cart functionality.
```

---

## 🎨 Customization Checklist

After setting up your project, customize these elements:

### **1. Branding & Identity**

```bash
# Update package.json
nano package.json
```

```json
{
  "name": "your-app-name",
  "version": "1.0.0",
  "description": "Your app description",
  "author": "Your Name <your.email@example.com>"
}
```

**Files to Update:**
- [ ] `package.json` - Name, version, description
- [ ] `index.html` - Title, meta description
- [ ] `public/` - Logo, favicon, OG images
- [ ] `src/components/Header.tsx` - App name, logo
- [ ] `src/components/Footer.tsx` - Copyright, links
- [ ] `README.md` - Project-specific documentation

### **2. Color Scheme**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          // ... your brand colors
          900: '#1e3a8a',
        },
      },
    },
  },
}
```

### **3. Environment Configuration**

```bash
# .env
VITE_APP_NAME=Your App Name
VITE_APP_URL=https://yourapp.com

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key

# Optional features
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
VITE_OPENAI_API_KEY=sk-xxx
```

### **4. Remove Unused Features**

**If you don't need Blockchain:**
```bash
rm src/components/BlockchainIntegration.tsx
rm src/hooks/useBlockchain.ts
rm src/hooks/useTransactions.ts
rm src/lib/blockchain.ts

# Remove from package.json
npm uninstall ethers
```

**If you don't need Azure AD:**
```bash
rm src/components/auth/AzureLogin.tsx
rm src/hooks/useAzureAuth.ts
rm src/lib/azure.ts

# Remove from package.json
npm uninstall @azure/msal-browser @azure/msal-react
```

**If you don't need AI:**
```bash
# Remove OpenAI integration
# Update package.json if you added OpenAI packages
```

### **5. Update Type Definitions**

```typescript
// src/types/index.ts
// Remove unused types
// Add your custom types

export interface YourCustomType {
  id: string
  // ... your fields
}
```

---

## 🗄️ Database Setup

### **Option 1: Supabase (Recommended)**

```bash
# 1. Create project at https://supabase.com

# 2. Update .env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 3. Create tables in Supabase Dashboard
# SQL Editor > New Query
```

**Example Schema:**
```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Your custom tables
CREATE TABLE public.your_table (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.your_table ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

### **Option 2: Custom Backend**

Update `src/lib/api-client.ts` with your API endpoint:

```typescript
const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
})
```

---

## 🎯 Development Workflow

### **1. Plan Features**
```markdown
## Sprint 1
- [ ] User authentication
- [ ] Basic dashboard
- [ ] Profile page

## Sprint 2
- [ ] Feature A
- [ ] Feature B
```

### **2. Create Feature Branches**
```bash
git checkout -b feature/user-dashboard
# ... develop feature
git add .
git commit -m "feat: implement user dashboard"
git push origin feature/user-dashboard
# Create pull request
```

### **3. Test Everything**
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check

# Linting
npm run lint
```

### **4. Deploy**
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or other platforms
npm run deploy
```

---

## 📚 Next Steps

After setup, follow this learning path:

1. **Week 1: Foundation**
   - [ ] Understand project structure
   - [ ] Set up development environment
   - [ ] Customize branding
   - [ ] Deploy to staging

2. **Week 2: Core Features**
   - [ ] Implement authentication
   - [ ] Build main user flows
   - [ ] Set up database schema
   - [ ] Write initial tests

3. **Week 3: Advanced Features**
   - [ ] Add integrations (payments, AI, etc.)
   - [ ] Implement admin features
   - [ ] Performance optimization
   - [ ] Security hardening

4. **Week 4: Polish & Launch**
   - [ ] UI/UX refinement
   - [ ] Complete test coverage
   - [ ] Documentation
   - [ ] Production deployment

---

## 💡 Pro Tips

### **Development**
- Always work in feature branches
- Commit frequently with clear messages
- Keep dependencies updated
- Use TypeScript strictly

### **Performance**
- Lazy load routes with `React.lazy()`
- Implement virtual scrolling for lists
- Optimize images and assets
- Use React Query for data caching

### **Security**
- Never commit `.env` files
- Use environment variables for secrets
- Implement rate limiting
- Validate all user input with Zod

### **Deployment**
- Test production builds locally
- Set up CI/CD pipelines
- Monitor error rates
- Keep backups

---

## 🆘 Common Issues

### **Build Fails**
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

### **Environment Variables Not Working**
```bash
# Vite requires VITE_ prefix
VITE_MY_VAR=value  # ✅ Correct
MY_VAR=value       # ❌ Won't work

# Restart dev server after .env changes
```

### **TypeScript Errors**
```bash
# Check TypeScript configuration
npm run type-check

# Fix with strict mode in mind
# Update tsconfig.json if needed
```

---

## 📞 Support

- **Documentation:** [Read the docs](/docs)
- **Issues:** [GitHub Issues](https://github.com/michelemonti/3ASYAPPS/issues)
- **Email:** michele.monti@me.com

---

**Happy Building! 🚀**

*Last Updated: October 2025*
