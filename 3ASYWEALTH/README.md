# 💰 3ASYWEALTH

> **Personal Wealth Tracking & Management Application**
>
> Gestisci e monitora il tuo patrimonio personale con semplicità e chiarezza

**Built with 3ASYAPP Template** | **React + TypeScript** | **Local-First**

---

## 🎯 Cos'è 3ASYWEALTH?

**3ASYWEALTH** è un'applicazione web per tracciare e calcolare il tuo patrimonio personale ("wealth"). Permette di registrare asset di diverse categorie, visualizzare totali e ripartizioni, e gestire i dati tramite import/export.

### ✨ Caratteristiche Principali

- ✅ **CRUD Completo**: Aggiungi, modifica ed elimina asset con facilità
- 📊 **Visualizzazioni Multiple**: Tabella dettagliata e sintesi con grafici
- 📥 **Import/Export**: Importa ed esporta dati in CSV o JSON
- 💾 **Persistenza Locale**: I dati vengono salvati automaticamente nel browser
- 🎨 **UI Moderna**: Interfaccia pulita e intuitiva con Tailwind CSS + Shadcn/UI
- 📱 **Responsive**: Funziona perfettamente su desktop, tablet e mobile
- 🎭 **Dati Demo**: Dataset di esempio (Miky Monti) per testare l'app

---

## 🚀 Quick Start

### Prerequisiti

- **Node.js** 18+ e npm
- Un browser moderno

### Installazione

\`\`\`bash
# 1. Naviga nella cartella del progetto
cd 3ASYWEALTH

# 2. Installa le dipendenze
npm install

# 3. Avvia il server di sviluppo
npm run dev

# 4. Apri il browser su http://localhost:8080
\`\`\`

**Fatto!** L'applicazione è pronta all'uso in modalità locale.

---

## 📖 Come Usare

### 1️⃣ Vista Tabella (CRUD)

- **Aggiungi asset**: Click "Aggiungi Asset" e compila il form
- **Modifica/Elimina**: Usa le icone nella tabella
- **Filtra**: Seleziona una categoria dal dropdown

### 2️⃣ Vista Sintesi

- Visualizza patrimonio totale
- Grafici a torta e barre per categoria
- Dettaglio breakdown percentuali

### 3️⃣ Import/Export

**Import:**
- CSV o JSON tramite pulsante "Importa"
- Formato CSV: `Asset / Società, Quota, Valore (€), Fonte, Note, Categoria`

**Export:**
- CSV: compatibile con Excel
- JSON: include metadata completi

### 4️⃣ Dati Demo

Menu "⋮" → "Carica Dati Demo" per testare con il dataset di Miky Monti:
- Partecipazioni societarie
- Immobili
- Beni personali (crypto, orologi, arte)
- **Totale: €758,250**

---

## 🗂️ Categorie Asset

| Categoria | Descrizione | Esempi |
|-----------|-------------|--------|
| **Partecipazioni** 🏢 | Quote societarie | Azioni, quote SRL |
| **Immobili** 🏠 | Proprietà immobiliari | Case, appartamenti |
| **Beni Personali** 💎 | Asset di valore | Crypto, orologi, arte |
| **Liquidità** 💰 | Cash e liquidi | Conti, depositi |

---

## 🛠️ Stack Tecnologico

- ⚛️ **React 18** + **TypeScript**
- ⚡ **Vite** - Build tool
- 🎨 **Tailwind CSS** + **Shadcn/UI**
- 🐻 **Zustand** - State management
- 📊 **Recharts** - Grafici
- 💾 **localStorage** - Persistenza

---

## 📁 Struttura Progetto

\`\`\`
src/
├── pages/
│   ├── WealthDashboard.tsx    # Dashboard principale
│   ├── AssetsTable.tsx         # Tabella CRUD
│   └── WealthSummary.tsx       # Sintesi + grafici
├── stores/
│   └── wealthStore.ts          # Zustand store
├── types/
│   └── wealth.ts               # TypeScript types
└── lib/
    └── importExport.ts         # Import/Export logic
\`\`\`

---

## 💾 Gestione Dati

### Dove vengono salvati?

I dati vengono salvati nel **localStorage del browser**:

✅ **Pro:**
- Sempre disponibili offline
- Nessun server necessario
- Privacy totale
- Zero costi

⚠️ **Importante:**
- Esporta regolarmente i dati come backup
- I dati sono legati al browser specifico
- Per multi-device: importa il file esportato

### Modalità Multi-Utente (Opzionale)

Il template supporta **Supabase o Azure AD** per:
- Salvataggio cloud
- Sync tra dispositivi
- Accesso multi-utente

Vedi `docs/AUTHENTICATION_GUIDE.md` per configurazione (opzionale).

---

## 🎨 Personalizzazione

### Modificare Categorie

Edita `src/types/wealth.ts`:

\`\`\`typescript
export type AssetCategory = 
  | 'Partecipazioni'
  | 'Immobili'
  | 'La Tua Categoria'  // Aggiungi qui
\`\`\`

### Cambiare Tema

- Colori: `tailwind.config.cjs`
- CSS Variables: `src/index.css`

---

## 🚀 Deploy

### Vercel (Raccomandato)

\`\`\`bash
npm i -g vercel
vercel --prod
\`\`\`

### Netlify

\`\`\`bash
npm run build
# Upload cartella dist/
\`\`\`

Vedi `docs/DEPLOYMENT.md` per dettagli.

---

## 🔧 Comandi

\`\`\`bash
npm run dev              # Dev server
npm run build            # Build produzione
npm run preview          # Preview build
npm run lint             # Linting
npm test                 # Tests
\`\`\`

---

## 🆘 Supporto

- 📧 **Email**: michele.monti@me.com
- 💼 **GitHub**: [@michelemonti](https://github.com/michelemonti)
- 🌐 **Website**: [michelemonti.me](https://michelemonti.me)

### Documentazione Template

- `docs/README.md` - Indice completo
- `docs/TEMPLATE_USAGE.md` - Guida template
- `docs/QUICKSTART.md` - Setup rapido

---

## 📄 License

Basato sul **3ASYAPP Template** di Michele Miky Monti.  
Vedi file `LICENSE` per dettagli.

---

**Made with ❤️ for wealth tracking**

*Ottobre 2025*
