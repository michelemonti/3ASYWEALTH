# 🤝 Contributing to 3ASYWEALTH

Thank you for your interest in contributing to **3ASYWEALTH**! This document provides guidelines and information for contributors.

> **📢 Note**: This project is licensed under the **MIT License**. All contributions are welcome!

## 🎯 Project Philosophy

3ASYWEALTH is built on three core principles:

1. **🔒 Privacy First**: All data processing happens in the browser. No backend, no tracking, no data collection.
2. **🌍 Open Source**: Transparent, auditable code that anyone can review and improve.
3. **🎨 Simplicity**: Clean, intuitive UI that anyone can use without technical knowledge.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- A modern browser (Chrome, Firefox, Safari, Edge)

### Setup Development Environment

```bash
# 1. Fork the repository on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/3asywealth.git
cd 3asywealth

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 5. Open http://localhost:8080 in your browser
```

---

## 📁 Project Structure

```
3asywealth/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── DataActions.tsx
│   │   ├── PDFReportButton.tsx
│   │   ├── PrivacyBadge.tsx
│   │   └── ...
│   ├── pages/            # Main application pages
│   │   ├── Landing.tsx
│   │   ├── AssetsTable.tsx
│   │   ├── WealthSummary.tsx
│   │   └── About.tsx
│   ├── stores/           # Zustand state management
│   │   └── wealthStore.ts
│   ├── types/            # TypeScript type definitions
│   │   └── wealth.ts
│   ├── lib/              # Utility functions
│   │   ├── importExport.ts
│   │   ├── pdfReport.ts
│   │   └── utils.ts
│   ├── i18n/             # Internationalization
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json   # English
│   │       ├── it.json   # Italian
│   │       └── es.json   # Spanish
│   └── App.tsx           # Main app component
├── docs/                 # Documentation
├── public/               # Static assets
└── package.json
```

---

## 🛠️ Tech Stack

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| **React 18** | UI Framework | [react.dev](https://react.dev) |
| **TypeScript** | Type Safety | [typescriptlang.org](https://www.typescriptlang.org) |
| **Vite** | Build Tool | [vitejs.dev](https://vitejs.dev) |
| **Tailwind CSS** | Styling | [tailwindcss.com](https://tailwindcss.com) |
| **Shadcn/UI** | Component Library | [ui.shadcn.com](https://ui.shadcn.com) |
| **Zustand** | State Management | [zustand-demo.pmnd.rs](https://zustand-demo.pmnd.rs) |
| **i18next** | Internationalization | [i18next.com](https://www.i18next.com) |
| **Recharts** | Data Visualization | [recharts.org](https://recharts.org) |
| **jsPDF** | PDF Generation | [github.com/parallax/jsPDF](https://github.com/parallax/jsPDF) |

---

## 🎨 How to Contribute

### 1. Report Bugs 🐛

Found a bug? Please open an issue with:
- **Clear title** describing the problem
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser and OS** information

### 2. Suggest Features 💡

Have an idea? Open an issue with:
- **Feature description** and use case
- **Why it matters** for users
- **Mockups or examples** if possible
- **Alignment with privacy-first philosophy**

### 3. Submit Pull Requests 🔧

#### Before You Start

1. Check existing issues and PRs to avoid duplicates
2. Open an issue first for major changes
3. Keep PRs focused on a single feature/fix

#### PR Guidelines

```bash
# 1. Create a feature branch
git checkout -b feature/your-feature-name

# 2. Make your changes
# - Write clean, readable code
# - Follow existing code style
# - Add comments for complex logic

# 3. Test your changes
npm run build
npm run lint

# 4. Commit with clear messages
git commit -m "feat: add new feature description"
# or
git commit -m "fix: resolve specific bug"

# 5. Push and create PR
git push origin feature/your-feature-name
```

#### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, no logic change)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Build process or tooling changes

---

## ✅ Code Quality Standards

### TypeScript

- ✅ Use strict TypeScript types
- ✅ Avoid `any` - use proper types or `unknown`
- ✅ Define interfaces for complex objects
- ❌ No implicit `any`

```typescript
// ✅ Good
interface Asset {
  id: string
  name: string
  value: number
}

// ❌ Bad
const asset: any = { ... }
```

### React Components

- ✅ Use functional components with hooks
- ✅ Extract reusable logic into custom hooks
- ✅ Keep components focused and single-purpose
- ✅ Use meaningful prop names

```typescript
// ✅ Good - Clear, typed, focused
interface AssetCardProps {
  asset: Asset
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function AssetCard({ asset, onEdit, onDelete }: AssetCardProps) {
  // Component logic
}
```

### Privacy & Security

- ✅ **Never add external API calls**
- ✅ **Never add analytics or tracking**
- ✅ **Never send data to servers**
- ✅ Keep all processing client-side
- ✅ Use `localStorage` only for persistence

### Internationalization

When adding text, always add translations for all three languages:

```typescript
// src/i18n/locales/en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description here"
  }
}

// src/i18n/locales/it.json
{
  "newFeature": {
    "title": "Nuova Funzionalità",
    "description": "Descrizione qui"
  }
}

// src/i18n/locales/es.json
{
  "newFeature": {
    "title": "Nueva Función",
    "description": "Descripción aquí"
  }
}
```

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Build for production (checks for build errors)
npm run build

# Preview production build
npm run preview
```

**Manual Testing Checklist:**
- [ ] Test with demo data
- [ ] Test import/export (CSV & JSON)
- [ ] Test CRUD operations (Create, Read, Update, Delete)
- [ ] Test PDF generation
- [ ] Test all three languages (EN/IT/ES)
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test localStorage persistence
- [ ] Check browser console for errors

---

## 📚 Adding New Features

### Example: Adding a New Asset Category

1. **Update Types** (`src/types/wealth.ts`):
```typescript
export type AssetCategory = 
  | 'shares' 
  | 'real-estate' 
  | 'personal-assets' 
  | 'cash'
  | 'new-category' // Add new category
```

2. **Add Translations** (`src/i18n/locales/*.json`):
```json
{
  "categories": {
    "new-category": "New Category Name"
  }
}
```

3. **Update UI** (if needed for colors/icons)
4. **Test** thoroughly
5. **Submit PR** with clear description

---

## 🌍 Internationalization (i18n)

Currently supported languages:
- 🇬🇧 English (en)
- 🇮🇹 Italian (it)
- 🇪🇸 Spanish (es)

### Adding a New Language

1. Create translation file: `src/i18n/locales/fr.json`
2. Copy structure from `en.json`
3. Translate all strings
4. Update `src/i18n/config.ts`:
```typescript
const resources = {
  en: { translation: en },
  it: { translation: it },
  es: { translation: es },
  fr: { translation: fr }, // Add new language
}
```
5. Add flag emoji and name to `LanguageSwitcher.tsx`

---

## 🎨 UI/UX Guidelines

- **Consistency**: Follow existing design patterns
- **Accessibility**: Use semantic HTML, ARIA labels
- **Responsive**: Mobile-first approach
- **Dark Theme**: Use existing gradient (`bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900`)
- **Colors**: Stick to Tailwind palette
- **Icons**: Use Lucide React icons

---

## 🚫 What NOT to Contribute

To maintain the privacy-first philosophy:

- ❌ Backend services or APIs
- ❌ User authentication systems
- ❌ Database integrations (except localStorage)
- ❌ Analytics or tracking tools
- ❌ Third-party services that send data externally
- ❌ Features requiring internet connection
- ❌ Ads or monetization features

---

## 📄 License & Usage Rights

### About This Project

This project is created by [Miky Monti](https://github.com/michelemonti) and licensed under the **MIT License**.

### License Terms

By contributing, you agree that your contributions will be licensed under the same **MIT License** that covers the project.

#### 📋 Attribution
When forking or redistributing:
- ✅ Keep the original copyright notice
- ✅ Credit the original author
- ✅ Maintain the MIT license file

### Why This Matters

The project creator invested significant time and effort to build a robust, privacy-first architecture. Respecting the license terms ensures:
- 🎨 Continued development and maintenance
- 🔒 Quality standards and security updates
- 🌍 A thriving open source community

**Bottom line**: Personal and educational use is completely free. Commercial ventures need a proper license.

---

## 🙏 Questions?

- **Open an issue** on GitHub
- **Review existing issues** for similar questions
- **Check the README** for basic setup

---

**Thank you for contributing to 3ASYWEALTH!** 🎉

Your help makes this project better for everyone while maintaining user privacy and security.
