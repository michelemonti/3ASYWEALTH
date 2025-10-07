# ⚡ QUICK START - 3ASYAPP TEMPLATE

**3 ways to start using this template - Choose what works best for you**

---

## 🎯 Choose Your Method

### **Method 1: Fork on GitHub** ⭐ Recommended
Keep connection with template updates

### **Method 2: Copy as Subfolder**
Work locally with multiple projects

### **Method 3: AI-Assisted Setup** 🚀 Fastest
Let AI handle everything

---

## 📖 Method 1: Fork on GitHub

**Best for:** New GitHub repositories with update tracking

```bash
# 1. Fork on GitHub (click Fork button)
#    https://github.com/michelemonti/3ASYAPPS

# 2. Clone YOUR fork
git clone https://github.com/YOUR-USERNAME/3ASYAPPS.git
cd "3ASYAPP - TEMPLATE"

# 3. Install
npm install

# 4. Configure environment
cp .env.example .env
nano .env  # Add your Supabase credentials

# 5. Start
npm run dev
```

**Pull future updates:**
```bash
git remote add upstream https://github.com/michelemonti/3ASYAPPS.git
git fetch upstream
git merge upstream/main
```

---

## 📂 Method 2: Copy as Subfolder

**Best for:** Local development, multiple projects

```bash
# 1. Clone original
git clone https://github.com/michelemonti/3ASYAPPS.git
cd 3ASYAPPS

# 2. Copy template
cp -r "3ASYAPP - TEMPLATE" "my-new-app"
cd my-new-app

# 3. Fresh git history (optional)
rm -rf .git
git init
git add .
git commit -m "Initial commit from 3ASYAPP template"

# 4. Install
npm install

# 5. Configure
cp .env.example .env
nano .env

# 6. Start
npm run dev
```

---

## 🤖 Method 3: AI-Assisted Setup

**Best for:** Fast setup with automatic customization

```bash
# 1. Create empty folder
mkdir my-awesome-app
cd my-awesome-app

# 2. Open in IDE
code .  # or cursor .

# 3. Tell AI agent:
```

**Copy this prompt to your AI assistant:**

```markdown
Create a new app using the 3ASYAPP template from ../3ASYAPPS/3ASYAPP - TEMPLATE

PROJECT INFO:
- Name: [Your App Name]
- Purpose: [What it does]
- Features: [What you need]

TASKS:
1. Copy template to this directory
2. Setup environment configuration
3. Customize branding (name, colors)
4. Remove unused features (blockchain/Azure/AI if not needed)
5. Create initial page structure
6. Setup database schema if needed

Features I need:
- [ ] Authentication (Supabase/Azure)
- [ ] Dashboard
- [ ] Admin panel
- [ ] Payments (Stripe)
- [ ] AI features
- [ ] Blockchain
- [ ] Other: [specify]

Remove if not needed:
- [ ] Blockchain features
- [ ] Azure AD
- [ ] AI integration

Let's start building!
```

---

## 🗄️ Quick Database Setup

### **Supabase (Recommended)**

```bash
# 1. Create project at supabase.com
# 2. Copy credentials to .env:

VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Create tables:**
```sql
-- In Supabase SQL Editor

-- User profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

---

## 📝 Environment Configuration

**Minimal setup (.env):**
```env
# Required
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
VITE_AUTH_MODE=supabase

# Optional features
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
VITE_OPENAI_API_KEY=sk-xxx
```

---

## ✅ What You Get Immediately

After setup, you have:

- ✅ **React 18 + TypeScript** - Modern stack
- ✅ **Tailwind CSS** - Beautiful UI out of the box
- ✅ **Authentication** - Login/signup ready
- ✅ **Database** - Supabase configured
- ✅ **Routing** - React Router setup
- ✅ **State Management** - Zustand configured
- ✅ **API Client** - Professional HTTP client
- ✅ **Error Handling** - Error boundaries
- ✅ **Type Safety** - Strict TypeScript
- ✅ **Testing Ready** - Vitest + Playwright
- ✅ **Deploy Ready** - Vercel configuration

---

## 🎨 Quick Customization

### **1. Change App Name**
```json
// package.json
{
  "name": "your-app-name",
  "description": "Your app description"
}
```

### **2. Update Branding**
```typescript
// tailwind.config.ts
colors: {
  primary: {
    500: '#your-color',
  }
}
```

### **3. Update Title**
```html
<!-- index.html -->
<title>Your App Name</title>
```

---

## 🚀 Development Commands

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm test               # Run unit tests
npm run test:ui        # Visual test UI
npm run test:e2e       # E2E tests

# Code Quality
npm run lint           # Check code
npm run type-check     # TypeScript check
```

---

## 🎯 Next Steps

### **Immediate (Day 1)**
1. ✅ Choose setup method
2. ✅ Install dependencies
3. ✅ Configure environment
4. ✅ Run dev server
5. ✅ Verify everything works

### **First Week**
1. 📝 Customize branding
2. 🗄️ Setup database schema
3. 🎨 Modify UI components
4. 🔧 Remove unused features
5. 📱 Test responsive design

### **First Month**
1. 🚀 Build core features
2. ✅ Write tests
3. 🔒 Security hardening
4. 📊 Performance optimization
5. 🌐 Deploy to production

---

## 📚 Full Documentation

**Want more details?**

- **[TEMPLATE_USAGE.md](TEMPLATE_USAGE.md)** - Complete usage guide ⭐
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup
- **[CUSTOMIZATION.md](CUSTOMIZATION.md)** - Customization guide
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment
- **[OVERVIEW_COLLEGHI.md](OVERVIEW_COLLEGHI.md)** - Guida in italiano

---

## 💡 Pro Tips

### **Development**
```bash
# Use React Query DevTools
# Open browser: http://localhost:8080
# Look for React Query icon (bottom left)

# Use Zustand DevTools
# Install Redux DevTools extension
# State changes will appear there
```

### **Performance**
```typescript
// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))

// Wrap in Suspense
<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### **Security**
```bash
# Never commit .env
echo ".env" >> .gitignore

# Use environment-specific values
# Development: .env.development
# Production: .env.production
```

---

## 🆘 Common Issues

### **Port already in use**
```bash
# Change port
npm run dev -- --port 3000
```

### **Module not found**
```bash
# Clear cache
rm -rf node_modules dist
npm install
```

### **Environment variables not loading**
```bash
# Restart dev server after .env changes
# Variables MUST start with VITE_
VITE_MY_VAR=value  # ✅ Works
MY_VAR=value       # ❌ Won't work
```

---

## 🤝 Support

**Michele Miky Monti**
- 📧 Email: michele.monti@me.com
- 💼 GitHub: [@michelemonti](https://github.com/michelemonti)
- 🌐 Website: [michelemonti.me](https://michelemonti.me)

**Resources:**
- [Full Documentation](README.md)
- [GitHub Issues](https://github.com/michelemonti/3ASYAPPS/issues)
- [Template Usage Guide](TEMPLATE_USAGE.md)

---

**Ready? Let's build something amazing! 🚀**

*Last Updated: October 2025*

