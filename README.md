# 💰 3ASYWEALTH

> **Personal Wealth Tracking - 100% Privacy**
>
> Manage your wealth in your browser. No server. No account. No registration.

**Open Source** | **React + TypeScript** | **Privacy-First**

> 📢 **Based on [3ASYAPP template](https://github.com/michelemonti/3asyapp) by Miky**
> 
> - ✅ Free for personal & open source use
> - 💰 Commercial use requires license

---

## 🎯 What is 3ASYWEALTH?

**3ASYWEALTH** is a web application to track and calculate your personal wealth with **maximum privacy**.

### 🔒 Absolute Privacy

Nobody wants to share their financial data. And you're right.

That's why **3ASYWEALTH runs entirely in your browser**:
- ❌ **No server receives your data**
- ❌ **No external database**
- ❌ **No account to create**
- ❌ **No registration**
- ✅ **Everything saved in browser localStorage**
- ✅ **Export/Import whenever you want**

### ✨ Key Features

- 🔐 **Privacy-First**: Your data never leaves your device
- ✅ **Full CRUD**: Add, edit, and delete assets with ease
- 📊 **Multiple Views**: Detailed table and summary with charts
- � **PDF Reports**: Generate professional wealth reports with charts
- �📥 **Import/Export**: Total portability with CSV/JSON (Excel/Google Sheets compatible)
- 🎭 **Demo Data**: Generic sample dataset to test the app
- 💾 **localStorage**: Automatic browser save, no data shared
- 🎨 **Modern UI**: Clean, intuitive interface with Tailwind CSS + Shadcn/UI
- 🌍 **Multilingual**: English, Italian, and Spanish support
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- A modern browser

### Installation

\`\`\`bash
# 1. Navigate to project folder
cd 3asywealth

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser at http://localhost:8080
\`\`\`

**Done!** The application is ready to use locally.

---

## 📖 How to Use

### 1️⃣ Assets Table

- **Add assets**: Click "Add Asset" and fill the form
- **Edit/Delete**: Use icons in the table
- **Filter**: Select a category from dropdown
- **Import/Export**: Use the menu (⋮) to import/export CSV or JSON
- **Demo Data**: Load sample data to test the app
- **Clear All**: Remove all data (with confirmation)

### 2️⃣ Summary View

- View total wealth and key metrics
- Pie and bar charts by category
- Detailed percentage breakdown
- **Generate PDF Report**: Export a professional report with all your data and charts

### 3️⃣ About Page

- Frequently asked questions
- Privacy guarantees
- Open source information
- Technical details

---

## 🗂️ Asset Categories

| Category | Description | Examples |
|-----------|-------------|--------|
| **Shares** 🏢 | Corporate holdings | Stocks, company shares |
| **Real Estate** 🏠 | Property | Houses, apartments |
| **Personal Assets** 💎 | Valuable assets | Crypto, watches, art |
| **Cash** 💰 | Liquid assets | Accounts, deposits |

---

## 🌍 Languages

3ASYWEALTH supports three languages:
- 🇬🇧 **English**
- 🇮🇹 **Italian** (Italiano)
- 🇪🇸 **Spanish** (Español)

Switch languages using the dropdown in the top navigation bar.

---

## 🛠️ Tech Stack

- ⚛️ **React 18** + **TypeScript**
- ⚡ **Vite** for build and development
- 🎨 **Tailwind CSS** + **Shadcn/UI** components
- 🐻 **Zustand** with localStorage persistence
- 📊 **Recharts** for data visualization
- 🌍 **i18next** for internationalization (EN/IT/ES)
- 📄 **jsPDF** + **html2canvas** for PDF report generation

---

## 📁 Project Structure

\`\`\`
src/
├── pages/
│   ├── Landing.tsx            # Landing page
│   ├── AssetsTable.tsx        # Assets CRUD table
│   ├── WealthSummary.tsx      # Summary + charts + PDF export
│   ├── About.tsx              # FAQ and information
│   └── NotFound.tsx           # 404 page
├── components/
│   ├── Navigation.tsx         # Top navigation bar
│   ├── DataActions.tsx        # Import/Export/Demo/Clear menu
│   ├── PDFReportButton.tsx    # PDF generation button
│   ├── PrivacyBadge.tsx       # Privacy reassurance badges
│   └── LanguageSwitcher.tsx   # Language selector
├── stores/
│   └── wealthStore.ts         # Zustand store with persistence
├── types/
│   └── wealth.ts              # TypeScript type definitions
├── lib/
│   ├── importExport.ts        # CSV/JSON import/export logic
│   ├── pdfReport.ts           # PDF report generation
│   └── utils.ts               # Utility functions
└── i18n/
    ├── config.ts              # i18next configuration
    └── locales/
        ├── en.json            # English translations
        ├── it.json            # Italian translations
        └── es.json            # Spanish translations
\`\`\`

---

## 💾 Data Management

Data is saved in the browser's **localStorage**:

✅ **Advantages**
- Always available offline
- No server needed
- Total privacy
- Zero costs

⚠️ **Important**
- Export data regularly as backup
- Data is tied to specific browser
- To use another device: import the exported file

---

## 🎨 Customization

Want to customize this app for your needs? Check out the [Customization Guide](docs/CUSTOMIZATION.md) for detailed instructions on:

- Changing app name and branding
- Modifying colors and theme
- Adding/removing asset categories
- Changing currency and number formats
- Adding new languages
- Customizing PDF reports
- And much more!

Quick customization paths:
- **Categories**: modify `src/types/wealth.ts`
- **Colors/Theme**: update `tailwind.config.cjs` and `src/index.css`
- **Translations**: edit files in `src/i18n/locales/`
- **Landing page**: edit `src/pages/Landing.tsx`

---

## 🚀 Transparent Deploy (GitHub Pages)

> All code and data remain public and verifiable. No backend involved.

### 1. Static build

```bash
npm run build
```

Ready-to-publish content is in `dist/`.

### 2. Manual publishing (branch `gh-pages`)

```bash
git subtree push --prefix dist origin gh-pages
```

or use GitHub Actions with a workflow like `actions/deploy-pages` that runs:

```bash
npm ci
npm run build
```

and publishes the `dist/` folder to GitHub Pages. No secrets required.

---

## 🔧 Commands

```bash
npm run dev       # Development server with HMR
npm run build     # Production build (dist/ folder)
npm run preview   # Serve local build
npm run lint      # TypeScript/ESLint quality check
```

---

## 📄 License & Credits

### License

This project is based on the **3ASYAPP** template which uses a **commercial license**. See the `LICENSE` file for complete details.

**In brief**: 
- 🆓 **Personal use**: completely free
- 🆓 **Portfolio/Demo**: completely free
- 🆓 **Learning/Study**: completely free
- 💰 **Commercial use**: **requires paid license**

### What is considered "Commercial Use"?

**Requires commercial license** 💰:
- ❌ Selling the software or derivative versions
- ❌ Offering paid services based on this code
- ❌ Using in business/enterprise applications
- ❌ Monetizing via ads, subscriptions, or fees
- ❌ White-labeling for clients
- ❌ SaaS (Software as a Service)

**Free use allowed** ✅:
- ✅ Personal projects (managing your own wealth)
- ✅ Personal portfolio / demo projects
- ✅ Educational projects / research
- ✅ Non-profit organizations
- ✅ Open source (with attribution)

### How to obtain a commercial license

If your use case is commercial, contact the template creator:

**Michele Miky Monti**
- 📧 Email: michele.monti@me.com
- 🌐 Website: https://michelemonti.me
- 💻 GitHub: https://github.com/michelemonti
- 📦 Template: [3ASYAPP](https://github.com/michelemonti/3asyapp)

**Available license options**:
- 💼 **Professional License**: For single commercial project
- 🏢 **Enterprise License**: For unlimited business use

### Credits & Attribution

This project is built using the **3ASYAPP** template by Michele Miky Monti.

**Attribution requirements**:
- ✅ Keep the copyright notice in the code
- ✅ Include credit: "Based on 3ASYAPP by Michele Miky Monti"
- ✅ Link to original template in documentation

**Original template**: [3ASYAPP by Miky](https://github.com/michelemonti/3asyapp)

---

**Made with ❤️ for wealth tracking by Miky**

*October 2025*
