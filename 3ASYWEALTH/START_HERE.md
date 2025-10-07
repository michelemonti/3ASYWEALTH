# 🚀 START HERE - 3ASYWEALTH Quick Guide

**Welcome to 3ASYWEALTH!** 👋

This is your personal wealth tracking application. Follow this guide to get started in 5 minutes.

---

## ⚡ Super Quick Start (60 seconds)

```bash
# 1. Open terminal in this folder (3ASYWEALTH)

# 2. Install (if you haven't)
npm install

# 3. Start the app
npm run dev

# 4. Open browser: http://localhost:8080
```

**Done!** The app is running. 🎉

---

## 🎯 First Steps

### Option A: Load Demo Data (Fastest)

1. Look for the **⋮** menu (three dots) in the top right
2. Click **"Carica Dati Demo"**
3. You'll see 9 example assets (total: €740,000)
4. Explore the two tabs:
   - **📋 Tabella Asset** - Table with all assets
   - **📊 Sintesi & Grafici** - Charts and summary

### Option B: Add Your First Asset

1. Click **"Aggiungi Asset"** button
2. Fill the form:
   - **Nome**: e.g., "Casa Milano"
   - **Categoria**: e.g., "Immobili"
   - **Quota**: e.g., "100%"
   - **Valore (€)**: e.g., "300000"
   - **Fonte**: e.g., "Valutazione 2025"
3. Click **"Aggiungi"**
4. Your first asset is created! 🎉

---

## 📚 What You Can Do

### ✏️ Manage Assets
- **Add**: Click "Aggiungi Asset"
- **Edit**: Click the pencil icon ✏️ on any row
- **Delete**: Click the trash icon 🗑️ on any row
- **Filter**: Use the dropdown to filter by category

### 📊 View Summary
- Switch to **"Sintesi & Grafici"** tab
- See:
  - Total wealth card
  - Pie chart (category distribution)
  - Bar chart (value comparison)
  - Category breakdown with percentages

### 📥 Import Data
1. Click **"Importa"** button
2. Choose format: **CSV** or **JSON**
3. Select your file
4. Assets are imported automatically

### 📤 Export Data
1. Click **"Esporta"** button
2. Choose format:
   - **CSV**: For Excel/Sheets
   - **JSON**: Complete backup with metadata

### 🔄 Other Actions
- **Load Demo**: Menu ⋮ → "Carica Dati Demo"
- **Clear All**: Menu ⋮ → "Cancella Tutti i Dati"

---

## 🗂️ Categories Explained

Your assets are organized in 4 categories:

| Icon | Category | Examples |
|------|----------|----------|
| 🏢 | **Partecipazioni** | Company shares, equity, startups |
| 🏠 | **Immobili** | Houses, apartments, land |
| 💎 | **Beni personali** | Crypto, watches, art, cars |
| 💰 | **Liquidità** | Bank accounts, cash, bonds |

---

## 💾 Where Is My Data?

Your data is saved **automatically** in your browser (localStorage).

**This means:**
- ✅ No account needed
- ✅ Works offline
- ✅ Complete privacy
- ✅ Fast and free

**Important:**
- Data is tied to this specific browser
- If you clear browser data, you'll lose your assets
- **Solution**: Export regularly as backup!

---

## 🔐 Backup Strategy

### Recommended Backup Routine

**Weekly:**
1. Export JSON (full backup)
2. Save file to cloud (Drive, Dropbox, etc.)

**Monthly:**
3. Export CSV (for analysis in Excel)

**To Restore:**
- Click "Importa" → select your backup file

---

## 📱 Use on Multiple Devices

Want to use 3ASYWEALTH on multiple devices?

1. **Export** from Device 1 (JSON)
2. **Import** into Device 2
3. Repeat when you update data

**Future**: Cloud sync available (requires setup - see docs)

---

## 🎨 Customize It

Want to change something?

### Add More Categories
Edit: `src/types/wealth.ts`

### Change Colors/Theme
Edit: `tailwind.config.cjs` or `src/index.css`

### Add Features
The template has many ready-to-use integrations (auth, DB, APIs)
See: `docs/TEMPLATE_USAGE.md`

---

## 🆘 Troubleshooting

### App doesn't start?
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Data not saving?
- Check browser privacy settings
- Disable "block cookies" for localhost
- Try a different browser

### Import not working?
- Verify CSV format (see SETUP.md)
- Check file encoding (UTF-8)
- Use JSON export/import for best results

### More help?
See `SETUP.md` for detailed troubleshooting

---

## 📖 Documentation

### For Users
- `README.md` - Complete user guide
- `SETUP.md` - Setup & troubleshooting
- `CHANGELOG.md` - Version history

### For Developers
- `PROJECT_SUMMARY.md` - Technical overview
- `docs/` folder - Template documentation

---

## 🎯 Quick Tips

1. **Use Demo Data First**: Get familiar with features
2. **Export Often**: Regular backups prevent data loss
3. **Organize by Category**: Makes analysis easier
4. **Update Values Regularly**: Keep wealth current
5. **Use Notes Field**: Add context (compensations, etc.)

---

## 🌟 Key Features

### What Makes 3ASYWEALTH Great

✅ **Simple CRUD**: Easy add/edit/delete  
✅ **Visual Insights**: Charts and graphs  
✅ **Import/Export**: CSV/JSON support  
✅ **Local-First**: Privacy & speed  
✅ **Responsive**: Works on all devices  
✅ **Modern UI**: Clean, professional design  
✅ **No Setup**: Works out of the box  
✅ **Extensible**: Built on powerful template  

---

## 🚀 Advanced Features (Optional)

The template supports (requires configuration):

- **Cloud Sync**: Supabase backend
- **Authentication**: Multi-user support
- **Real-time**: Live updates
- **APIs**: Integrate price feeds
- **Mobile App**: PWA support

See `docs/` for guides on these features.

---

## 💡 Use Cases

### Personal Wealth Tracking
Track your entire net worth:
- Investments
- Real estate
- Valuables
- Cash

### Family Wealth Management
Share and track family assets:
- Estate planning
- Inheritance tracking
- Joint asset management

### Business Portfolio
Track business holdings:
- Company shares
- Investment portfolio
- Asset allocation

---

## 📊 Sample Wealth Breakdown

**Generic Demo (€740,000 total):**

```
Partecipazioni   €155,000  (21%)
├─ Startup Tech SRL    €50,000
├─ Consulting Business €80,000
└─ Franchise Food      €25,000

Immobili         €430,000  (58%)
├─ Casa Principale     €250,000
└─ Appartamento Affitto €180,000

Beni personali   €70,000   (9%)
├─ Auto Collezione     €50,000
└─ Gioielli e Orologi  €20,000

Liquidità        €85,000   (12%)
├─ Conto Corrente      €35,000
└─ Portfolio Crypto    €50,000
├─ Orologi         €15,000
└─ Opere d'arte    €5,000
```

---

## ✨ Pro Tips

1. **Valuation Source**: Always note the basis for values
2. **Update Frequency**: Monthly for investments, yearly for property
3. **Category Strategy**: Keep it simple, use 4 categories
4. **Notes Field**: Record income/compensations
5. **Export Before Changes**: Backup before major edits

---

## 🎉 You're Ready!

You now know everything to use 3ASYWEALTH effectively.

### Next Steps:
1. ✅ Start with demo data or add your first asset
2. ✅ Explore both tabs (Table & Summary)
3. ✅ Try export/import features
4. ✅ Set up a backup routine
5. ✅ Customize to your needs

---

## 📞 Need Help?

- **Email**: michele.monti@me.com
- **Docs**: Check README.md and SETUP.md
- **GitHub**: Report issues

---

**Happy wealth tracking! 💰**

*Built with 3ASYAPP Template - October 2025*
