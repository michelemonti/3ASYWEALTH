# GitHub Pages Deployment Guide

> **Author:** Michele Miky Monti

Complete guide for deploying the 3ASYAPP template to **www.3asy.app** using GitHub Pages.

---

## 🎯 Overview

This template is optimized for **dual deployment**:
- ✅ **GitHub Pages**: Primary deployment (www.3asy.app)
- ✅ **Vercel**: Alternative/staging deployment

---

## �� Quick Start

### Automatic Deployment

Every push to `main` triggers automatic deployment via GitHub Actions.

```bash
git add .
git commit -m "Update application"
git push origin main
```

→ Automatic build and deploy to www.3asy.app

---

## ⚙️ Setup Instructions

### 1. GitHub Repository Settings

Go to **Settings** → **Pages**:

```
Source: Deploy from a branch
Branch: gh-pages
Directory: / (root)
Custom domain: www.3asy.app
☑️ Enforce HTTPS
```

### 2. GitHub Secrets

Add environment variables in **Settings** → **Secrets and variables** → **Actions**:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Optional secrets (if using these features):
```bash
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
VITE_OPENAI_API_KEY=your-openai-key
VITE_CONTRACT_ADDRESS=your-blockchain-address
```

### 3. DNS Configuration

Configure your domain DNS (at your domain provider):

**For www.3asy.app:**
```
Type: CNAME
Name: www
Value: michelemonti.github.io
TTL: 3600
```

**For apex domain (3asy.app):**
```
Type: A
Name: @
Values:
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
TTL: 3600
```

### 4. Verify CNAME

The `public/CNAME` file contains:
```
www.3asy.app
```

This is automatically copied to the build output.

---

## 📦 Build Configuration

### Vite Config

The `vite.config.ts` is configured for root path deployment:

```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/' : '/',
  // ...
}));
```

### NPM Scripts

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

---

## 🔧 GitHub Actions Workflow

The `.github/workflows/deploy.yml` handles automatic deployment:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies (npm ci)
      - Build application
      - Upload to GitHub Pages

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - Deploy to GitHub Pages
```

**Features:**
- ✅ Automatic deployment on push to main
- ✅ Manual trigger via GitHub Actions UI
- ✅ Environment variables from GitHub Secrets
- ✅ Build caching for faster deployments
- ✅ Artifact upload and deployment

---

## 🌐 Environment Variables

### Production Environment

Create `.env.production` for local production builds:

```bash
# Supabase (Required)
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Authentication
VITE_AUTH_MODE=supabase

# Azure AD (Optional)
VITE_AZURE_CLIENT_ID=
VITE_AZURE_TENANT_ID=
VITE_AZURE_REDIRECT_URI=https://www.3asy.app/auth/callback

# Features (Optional)
VITE_ENABLE_BLOCKCHAIN=false
VITE_AI_ENABLED=false
```

### Supabase Configuration

⚠️ **Important:** Add production URLs to Supabase Auth settings:

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://www.3asy.app
   https://www.3asy.app/**
   https://www.3asy.app/auth/callback
   ```

---

## 🔍 Deployment Verification

### 1. Check GitHub Actions

Go to **Actions** tab in your repository:
- ✅ Workflow run should be green
- ✅ Build and deploy jobs completed
- ✅ No errors in logs

### 2. Check Deployment

Visit: https://www.3asy.app

Verify:
- ✅ Application loads correctly
- ✅ No console errors
- ✅ All routes work (SPA routing)
- ✅ Authentication functional
- ✅ HTTPS enabled with valid certificate

### 3. Test Core Features

```bash
# Manual testing checklist
✅ Homepage loads
✅ Navigation works
✅ Login/Register functional
✅ Dashboard accessible (after login)
✅ All pages load correctly
✅ No 404 errors on refresh
✅ Mobile responsive
✅ Performance acceptable
```

---

## 🐛 Troubleshooting

### 404 on Page Refresh

**Symptom:** Direct URL navigation returns 404

**Solution:** GitHub Pages SPA routing is handled by `index.html` fallback in workflow

### Build Fails

**Check:**
```bash
# Run build locally
npm run build

# Check for TypeScript errors
npm run lint

# Verify dependencies
npm run audit:deps
```

### Environment Variables Not Working

**Solution:**
1. Verify secrets in GitHub Settings
2. Secrets must start with `VITE_` to be available in client
3. Rebuild and redeploy after adding secrets

### Custom Domain Not Working

**Check DNS:**
```bash
# Verify DNS propagation
dig www.3asy.app

# Should show CNAME to michelemonti.github.io
```

**Check GitHub Settings:**
- Custom domain entered correctly
- HTTPS enforced
- DNS check passed

### SSL Certificate Issues

**Solution:**
- Wait 24-48 hours for DNS propagation
- Verify DNS records correct
- Remove and re-add custom domain in GitHub Settings

---

## 📊 Performance Optimization

### GitHub Pages Features

✅ **Global CDN**: Fast content delivery worldwide
✅ **Automatic Compression**: Gzip/Brotli compression
✅ **Caching**: Automatic asset caching
✅ **HTTPS**: Free SSL certificates

### Vite Optimization

The build is optimized with:
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Manual chunks for better caching

---

## 🔐 Security

### HTTPS

GitHub Pages provides free SSL certificates via Let's Encrypt.

### Security Headers

Add to `vercel.json` (works on both platforms):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Frame-Options", "value": "DENY"},
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}
      ]
    }
  ]
}
```

---

## 🎯 Vercel Alternative

For Vercel deployment, see [DEPLOYMENT.md](./DEPLOYMENT.md).

**Why use both?**
- GitHub Pages: Free, stable, integrated
- Vercel: Preview deployments, analytics, edge functions

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domain Setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🆘 Support

Need help? Check:
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/michelemonti/3ASYAPPS/issues)

---

**Author:** Michele Miky Monti  
**Website:** www.3asy.app  
**Repository:** github.com/michelemonti/3ASYAPPS
