# 🚀 3ASYWEALTH - Setup Guide

**Guida completa per iniziare con 3ASYWEALTH**

---

## 📋 Indice

1. [Installazione](#installazione)
2. [Primo Avvio](#primo-avvio)
3. [Importare il CSV Demo](#importare-il-csv-demo)
4. [Gestione Dati](#gestione-dati)
5. [Troubleshooting](#troubleshooting)

---

## 1. Installazione

### Prerequisiti

Prima di iniziare, assicurati di avere:

- **Node.js** versione 18 o superiore
  - Verifica con: `node --version`
  - Download: https://nodejs.org/
- **npm** (incluso con Node.js)
- Un **browser moderno** (Chrome, Firefox, Safari, Edge)

### Passi di Installazione

```bash
# 1. Naviga nella cartella del progetto
cd 3ASYWEALTH

# 2. Installa tutte le dipendenze
npm install

# 3. Copia il file di configurazione (già fatto se presente)
# Il file .env può rimanere vuoto per la modalità demo
cp .env.example .env

# 4. Avvia l'applicazione
npm run dev
```

### Verifica Installazione

Se tutto è andato bene, dovresti vedere:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: use --host to expose
```

Apri il browser su **http://localhost:8080** e dovresti vedere la dashboard di 3ASYWEALTH.

---

## 2. Primo Avvio

### Cosa Vedere alla Prima Apertura

All'apertura dell'app vedrai:

- **Header** con il titolo "3ASYWEALTH"
- Due **tab**: "📋 Tabella Asset" e "📊 Sintesi & Grafici"
- Pulsanti: **Esporta**, **Importa**, **⋮ Menu**
- **Nessun asset** (tabella vuota)

### Opzione 1: Carica Dati Demo

Il modo più veloce per testare l'app:

1. Click sul menu **⋮** (tre puntini in alto a destra)
2. Seleziona **"Carica Dati Demo"**
3. Verrai caricati 9 asset d'esempio (dataset generico)
4. Naviga tra le tab per esplorare le funzionalità

### Opzione 2: Aggiungi il Primo Asset

Preferisci partire da zero?

1. Vai alla tab **"📋 Tabella Asset"**
2. Click su **"Aggiungi Asset"**
3. Compila il form:
   - **Nome**: es. "Casa Milano"
   - **Categoria**: es. "Immobili"
   - **Quota**: es. "100%"
   - **Valore (€)**: es. "300000"
   - **Fonte**: es. "Valutazione agenzia 2025"
   - **Note**: (opzionale)
4. Click **"Aggiungi"**

Il tuo primo asset è stato creato! 🎉

---

## 3. Importare il CSV Demo

### Creare un CSV di Test

Puoi creare un file CSV con questo contenuto (esempio semplificato):

**File: `my-wealth.csv`**

```csv
Asset / Società,Quota,Valore (€),Fonte / Base di stima,Note,Categoria
Casa Milano,100%,300000,Valutazione 2025,,Immobili
Azioni Apple,50 shares,25000,Valore di mercato,,Beni personali
Studio XYZ SRL,25%,50000,EV stimato 200k,,Partecipazioni
Conto Corrente,100%,15000,Saldo attuale,,Liquidità
```

### Importare il CSV

1. Salva il file CSV sul tuo computer
2. Nell'app, click su **"Importa"** → **"Importa da CSV"**
3. Seleziona il file CSV
4. Gli asset verranno importati automaticamente

**Formato CSV Richiesto:**

Le colonne devono essere nell'ordine:
1. Asset / Società
2. **Quota** (o qualsiasi altra colonna simile)
3. Valore (€)
4. Fonte / Base di stima
5. Note / Compensi
6. Categoria

**Categorie Valide:**
- `Partecipazioni`
- `Immobili`
- `Beni personali`
- `Liquidità`

### CSV Demo Completo (Esempio Generico)

Se vuoi il CSV completo del dataset demo, crealo così:

**File: `demo-wealth.csv`**

```csv
Asset / Società,Quota,Valore (€),Fonte / Base di stima,Note,Categoria
Startup Tech SRL,20%,50000,Valutazione Series A,Partecipazione minoritaria,Partecipazioni
Consulting Business,100%,80000,Valore patrimoniale,Società di consulenza,Partecipazioni
Franchise Food,15%,25000,Valutazione franchising,Ristorante in franchising,Partecipazioni
Casa Principale,100%,250000,Valore di mercato,Residenza principale,Immobili
Appartamento Affitto,50%,180000,Valore di mercato,Investimento immobiliare,Immobili
Auto Collezione,-,50000,Valutazione collezionista,Auto d'epoca,Beni personali
Gioielli e Orologi,-,20000,Valutazione assicurativa,Collezione personale,Beni personali
Conto Corrente,100%,35000,Saldo bancario,Liquidità disponibile,Liquidità
Portfolio Crypto,100%,50000,Valutazione di mercato,BTC + ETH,Liquidità
```
---

## 4. Gestione Dati

### Dove Vengono Salvati i Dati?

I dati sono salvati nel **localStorage del browser**:

- **Path tecnico**: `localStorage['wealth-storage']`
- **Formato**: JSON
- **Limite**: ~5-10MB (più che sufficiente)

### Backup dei Dati

**Metodo 1: Export Regolare**

Ogni settimana (o quando vuoi):
1. Click **"Esporta"** → **"Esporta JSON"**
2. Salva il file in un posto sicuro (Google Drive, Dropbox, USB)

**Metodo 2: Export CSV per Excel**

Per analisi o report:
1. Click **"Esporta"** → **"Esporta CSV"**
2. Apri con Excel, Google Sheets, ecc.

### Ripristinare i Dati

Se hai cambiato browser o cancellato i dati:

1. Click **"Importa"** → **"Importa da JSON"**
2. Seleziona il file di backup
3. I tuoi dati sono ripristinati!

### Reset Completo

Per ricominciare da zero:

1. Menu **⋮** → **"Cancella Tutti i Dati"**
2. Conferma l'operazione
3. ⚠️ **Attenzione**: Operazione irreversibile! Esporta prima se necessario.

---

## 5. Troubleshooting

### Problema: "npm install" fallisce

**Errore:** `EACCES: permission denied`

**Soluzione:**
```bash
# Su Linux/Mac
sudo npm install -g npm@latest

# Su Windows (apri PowerShell come Admin)
npm install -g npm@latest
```

**Errore:** `Cannot find module 'xyz'`

**Soluzione:**
```bash
# Cancella node_modules e reinstalla
rm -rf node_modules package-lock.json
npm install
```

### Problema: App non si carica

**Sintomo:** Pagina bianca o errore nel browser

**Soluzioni:**

1. **Controlla la console del browser** (F12 → Console)
2. **Verifica che Vite sia in esecuzione**:
   ```bash
   npm run dev
   ```
3. **Svuota cache del browser** (Ctrl+Shift+R o Cmd+Shift+R)
4. **Prova in incognito** per escludere problemi di estensioni

### Problema: Dati non vengono salvati

**Sintomo:** Asset scompaiono al refresh

**Cause possibili:**

1. **localStorage disabilitato**: Controlla impostazioni privacy browser
2. **Modalità incognito**: In incognito i dati non persistono
3. **Quota storage superata**: Molto raro, cancella dati di altri siti

**Soluzione:**
- Abilita cookies e storage nelle impostazioni browser
- Usa modalità normale (non incognito)
- Esporta i dati e usa backup JSON

### Problema: Import CSV non funziona

**Sintomo:** "Nessun asset trovato nel file"

**Cause:**

1. **Formato colonne errato**: Controlla che le colonne siano nell'ordine giusto
2. **Categoria non valida**: Usa solo le 4 categorie supportate
3. **Encoding del file**: Salva il CSV in UTF-8

**Soluzione:**
```csv
# Template corretto (copia questo header)
Asset / Società,Quota,Valore (€),Fonte / Base di stima,Note,Categoria
```

### Problema: Grafici non si vedono

**Sintomo:** Vista Sintesi mostra solo card, nessun grafico

**Causa:** Nessun asset presente

**Soluzione:**
- Aggiungi almeno 1 asset per vedere i grafici
- Oppure carica i dati demo

### Problema: Port 8080 già in uso

**Errore:** `Port 8080 is already in use`

**Soluzione:**
```bash
# Metodo 1: Usa un'altra porta
npm run dev -- --port 3000

# Metodo 2: Trova e killa il processo sulla porta 8080
# Linux/Mac
lsof -ti:8080 | xargs kill -9

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Problema: TypeScript errors

**Errore:** Errori di tipo durante sviluppo

**Soluzione:**
```bash
# Ricompila i types
npm run build

# Se persiste, reinstalla dipendenze
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Supporto Aggiuntivo

Se hai ancora problemi:

1. **Controlla la documentazione del template**: `docs/TROUBLESHOOTING.md`
2. **GitHub Issues**: Cerca problemi simili
3. **Contatta il supporto**:
   - 📧 Email: michele.monti@me.com
   - 💼 GitHub: [@michelemonti](https://github.com/michelemonti)

---

## ✅ Checklist Post-Setup

Dopo il setup, verifica di aver fatto tutto:

- [ ] Installato Node.js 18+
- [ ] Eseguito `npm install` con successo
- [ ] App in esecuzione su http://localhost:8080
- [ ] Caricato dati demo o aggiunto primo asset
- [ ] Testato import/export CSV
- [ ] Navigato tra le tab (Tabella e Sintesi)
- [ ] Fatto un backup export JSON

Se hai spuntato tutto, **sei pronto!** 🎉

---

**Buon tracking del tuo patrimonio! 💰**
