# 💰 3ASYWEALTH

> **Personal Wealth Tracking - 100% Privacy**
>
> Gestisci il tuo patrimonio nel tuo browser. Nessun server. Nessun account. Nessuna registrazione.

**Open Source** | **React + TypeScript** | **Privacy-First**

---

## 🎯 Cos'è 3ASYWEALTH?

**3ASYWEALTH** è un'applicazione web per tracciare e calcolare il tuo patrimonio personale con la **massima privacy**.

### 🔒 Privacy Assoluta

Nessuno vuole condividere i propri dati finanziari. E avete ragione.

Per questo **3ASYWEALTH funziona interamente nel tuo browser**:
- ❌ **Nessun server riceve i tuoi dati**
- ❌ **Nessun database esterno**
- ❌ **Nessun account da creare**
- ❌ **Nessuna registrazione**
- ✅ **Tutto salvato in localStorage del browser**
- ✅ **Esporta/Importa quando vuoi**

### ✨ Caratteristiche Principali

- 🔐 **Privacy-First**: I tuoi dati non lasciano mai il tuo dispositivo
- ✅ **CRUD Completo**: Aggiungi, modifica ed elimina asset con facilità
- 📊 **Visualizzazioni Multiple**: Tabella dettagliata e sintesi con grafici
- 📥 **Import/Export**: Portabilità totale con CSV/JSON (Excel/Google Sheets compatibile)
- 💾 **localStorage**: Salvataggio automatico nel browser, nessun dato condiviso
- 🎨 **UI Moderna**: Interfaccia pulita e intuitiva con Tailwind CSS + Shadcn/UI
- 📱 **Responsive**: Funziona perfettamente su desktop, tablet e mobile
- 🎭 **Dati Demo**: Dataset generico d'esempio per testare l'app

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

Menu "⋮" → "Carica Dati Demo" per testare con dati d'esempio generici:
- Partecipazioni societarie
- Immobili
- Beni personali (crypto, orologi, arte)
**Demo Dataset** incluso:
- **Totale: €740,000** (example data)
- 9 asset d'esempio (partecipazioni, immobili, beni personali, liquidità)

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
- ⚡ **Vite** per build e sviluppo
- 🎨 **Tailwind CSS** + componenti **Shadcn/UI**
- 🐻 **Zustand** con persistenza su localStorage
- 📊 **Recharts** per la visualizzazione dei dati

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

I dati vengono salvati nel **localStorage del browser**:

✅ **Vantaggi**
- Sempre disponibili offline
- Nessun server necessario
- Privacy totale
- Zero costi

⚠️ **Importante**
- Esporta regolarmente i dati come backup
- I dati sono legati al browser specifico
- Per usare un altro dispositivo: importa il file esportato

---

## 🎨 Personalizzazione

- Categorie: modifica `src/types/wealth.ts`
- Colori/Tema: aggiorna `tailwind.config.cjs` e `src/index.css`
- Testo landing page: `src/pages/Landing.tsx`

---

## 🚀 Deploy trasparente (GitHub Pages)

> Tutto il codice e i dati rimangono pubblici e verificabili. Nessun backend coinvolto.

### 1. Build statica

```bash
npm run build
```

Il contenuto pronto per la pubblicazione si trova in `dist/`.

### 2. Pubblicazione manuale (branch `gh-pages`)

```bash
git subtree push --prefix dist origin gh-pages
```

oppure usa GitHub Actions con uno workflow tipo `actions/deploy-pages` che esegue:

```bash
npm ci
npm run build
```

e pubblica la cartella `dist/` su GitHub Pages. Nessun segreto richiesto.

---

## 🔧 Comandi

```bash
npm run dev       # Server di sviluppo con HMR
npm run build     # Build produzione (cartella dist/)
npm run preview   # Serve la build locale
npm run lint      # Controllo qualità TypeScript/ESLint
```

---

## 📄 License

Codice rilasciato sotto licenza **MIT**. Consulta il file `LICENSE` per i dettagli.

---

**Made with ❤️ for wealth tracking**

*Ottobre 2025*
