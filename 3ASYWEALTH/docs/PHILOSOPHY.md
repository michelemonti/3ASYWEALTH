# 🧭 3ASYAPP TEMPLATE – PHILOSOPHY

> Prima pubblicazione pubblica su GitHub. Nessuna posa da “framework definitivo”: è un set di pattern pragmatici cresciuti costruendo prodotti veri.

## 🇮🇹 Visione (Italiano)

Questo template nasce da tre esigenze reali:
1. Ridurre il tempo “noioso” (bootstrapping, wiring, config ripetitiva)
2. Avere una base coerente e leggibile che non ti faccia odiare il refactor dopo 3 mesi
3. Rendere facili da attivare funzioni opzionali (auth, realtime, AI, blockchain) senza obbligarle nel path iniziale

### Principi Chiave

| Principio | Descrizione Breve |
|-----------|-------------------|
| Progressivo, non imposto | Parti in Demo Mode. Attivi solo ciò che ti serve quando serve. |
| Leggibile > “Clever” | Il codice deve essere immediatamente decodificabile da un umano assonnato. |
| Complessità a strati | Prima shipping, poi hardening, poi ottimizzazione. Mai tutto subito. |
| Flow > Cerimonie | Meno rituali, più iterazione rapida. Tooling solo se accelera. |
| Feature Toggles Mentali | Ogni integrazione deve poter vivere scollegata. Nessun coupling nascosto. |
| Ridurre attrito cognitivo | File prevedibili, naming coerente, fallback sicuri. |
| Ownership reale | Capisci cosa togli prima di cosa aggiungi. |
| Beautiful Pragmatism | UX e DX pulita senza perdere tempo in pixel–feticismo prematuro. |

### Pattern Intenzionali

1. Demo Mode di default → Zero paura di clonare e partire.
2. Strato Auth modulare → Supabase / Azure AD come plugin mentali.
3. API client tipizzato semplice → No over–abstraction precoce.
4. Store leggero (Zustand) → Evito incollare Redux “solo perché”.
5. Hooks dedicati vs mega-hook → Granularità leggibile, non micro–frammentazione.
6. Error Boundary presente ma minimale → Estendibile verso monitoring (Sentry ecc.).
7. Ethers + Blockchain hook opzionale → Non inquina il resto se non usato.
8. Shadcn/UI come kit → Personalizzabile, non lock-in.
9. Documentazione multi-profondità → Quickstart (60s) + Approfondimenti quando/solo se servono.
10. Zero Changelog esibito → La storia privata non interessa, conta lo stato attuale.

### Cosa NON È
- Non è un “boilerplate enterprise” gonfio di pattern per impressionare.
- Non è un generatore magico (richiede comunque cervello & scelte).
- Non è un framework: puoi smontarlo a pezzi senza che esploda.

### Filosofia di Evoluzione
1. Prima la stabilità base (build, lint, effetti prevedibili)
2. Poi developer experience (tipi, auto–refactor facile)
3. Poi sicurezza minima (validation, error boundary, sanitizzazione)
4. Solo dopo performance minute (lazy, splitting fine)
5. Hardening/observability se il progetto scala davvero

### Tono & Attitudine
“Vibe coding” ma con responsabilità: sperimentazione rapida senza lasciare macerie. Ogni file cerca di spiegarsi da solo; i commenti sono rari e funzionali. Niente buzzword bingo.

### Come Usarlo Bene
1. Parti senza modificare la struttura → Capisci prima i flussi.
2. Elimina cartelle/feature che non userai nei primi 30 giorni.
3. Aggiungi tool solo se riduce un attrito misurato.
4. Sostituisci l’auth se hai già un IdP tuo (l’interfaccia rimane semplice).
5. Documenta decisioni anomale in 1–2 righe, non romanzi.

### Filosofia di Rilascio
Pubblicare direttamente la “versione buona” (2.0) senza musealizzare il passato: riduce rumore e onboarding cognitive load.

---
## EN (Short English Snapshot)

This repository is a pragmatic extraction of repeatable patterns from real product builds. It optimizes for: fast start, optional complexity, maintainable readability.

Core values:
- Start in Demo Mode, progressively enable
- Readability over clever abstractions
- Layered complexity (ship → harden → optimize)
- Low cognitive load naming & layout
- Optional integrations instead of forced architecture

Not a framework. Not a silver bullet. A curated toolbox.

---
## Domande / Collaborazione
Vuoi adattarlo a un contesto aziendale, snellirlo o scalarlo? Scrivimi: **michele.monti@me.com**

---
*Curated by Michele Miky Monti – Entrepreneur & Technology Generalist*
