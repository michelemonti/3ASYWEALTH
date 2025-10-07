// Lightweight i18n utility (no external deps) focused on Home & Pricing pages.
// Extend dictionaries as needed. Keys accessed via dot notation (e.g. t('home.hero.title')).

export type SupportedLocale = 'it' | 'en'

type Dictionary = Record<string, any>

const dictionaries: Record<SupportedLocale, Dictionary> = {
  it: {
    common: {
      demoMode: 'Demo Mode',
      readPhilosophy: 'Leggi la Philosophy',
      portfolio: 'Portfolio / Contact',
      getStarted: 'Inizia Subito',
      features: 'Scopri le Features',
      pricing: 'Pricing',
      home: 'Home',
      signIn: 'Sign In',
      signOut: 'Sign Out',
    },
    footer: {
      brand: {
        title: '3ASYAPPS',
        tagline: 'Operations utilities for business',
        description1: 'Strumenti e applicazioni per migliorare l\'efficienza operativa nelle aziende.',
        description2: 'Dalla whistleblowing compliance alla generazione 3D AI, costruiamo soluzioni mirate e scalabili.'
      },
      templateSection: 'Template',
      ecosystemSection: 'Ecosistema',
      supportSection: 'Supporto',
      ecosystem: {
        whistle: '3ASYWHISTLE (Whistleblowing)',
        modeling: '3ASYMODELING (3D AI)',
        hr: '3ASYHR (HR Solutions)',
        channel: '3ASYCHANNELMANAGER (Channel Sync)'
      },
      links: {
        home: 'Home',
        pricing: 'Pricing',
        features: 'Features',
        githubRepo: 'GitHub Repository',
        issues: 'Segnala Issue',
        discussions: 'Discussioni'
      },
      copyright: 'Tutti i diritti riservati'
    },
    home: {
      badge: 'Professional React Template by Michele Miky Monti - www.3asy.app',
      hero: {
        title: '3ASYAPP Template',
        line1: 'Il template enterprise per creare qualsiasi webapp ti venga in mente.',
        line2: 'React + TypeScript + Tailwind + Supabase + Blockchain ready. Tutto configurato e pronto per il deployment.'
      },
      cta: {
        primary: 'Inizia Subito',
        secondary: 'Scopri le Features'
      },
      stack: {
        title: 'Stack Tecnologico Enterprise',
        subtitle: 'Le migliori tecnologie integrate e pronte all\'uso'
      },
      features: {
        title: 'Tutto Quello Che Ti Serve',
        subtitle: 'Componenti, integrations e configurazioni enterprise-ready'
      },
      useCases: {
        title: 'Infinite Possibilità',
        subtitle: 'Esempi di webapp che puoi creare con questo template'
      },
      curator: {
        title: 'Curato da Michele Miky Monti',
        description: 'Entrepreneur & Technology Generalist. Questo template nasce da progetti reali: pattern pragmatici, complessità opzionale, demo mode di default. Niente buzzword bingo — solo una base pulita che puoi smontare, estendere e ri–brandizzare senza attrito.'
      },
      ethos: {
        demoFirst: 'Demo First',
        optionalComplexity: 'Optional Complexity',
        readablePatterns: 'Readable Patterns'
      },
      blockchain: {
        title: 'Blockchain Integration Demo',
        subtitle: 'Prova subito la connessione Web3 - no configuration needed'
      },
      ctaSection: {
        title: 'Pronto a Creare la Tua Webapp?',
        subtitle: 'Risparmia settimane di setup. Inizia subito con il codice production-ready.'
      },
      credit: 'Template sviluppato da',
      philosophyButton: 'Leggi la Philosophy',
      portfolioButton: 'Portfolio / Contact'
    },
    pricing: {
      badge: 'Professional Template by Michele Miky Monti - www.3asy.app',
      title: 'Licenza 3ASYAPP Template',
      subtitle: 'Ottieni accesso completo al framework enterprise per creare webapp ultra-performanti',
      plans: {
        starter: {
          name: 'Starter',
          desc: 'Per progetti personali e prototipi',
          price: 'ASK MIKY!',
          features: '✅ Template completo | ✅ Componenti UI base | ✅ Configurazione Vite/Tailwind | ✅ TypeScript setup | ❌ Integrazioni premium | ❌ Pronto Intervento',
          button: 'Dimmi la tua idea'
        },
        professional: {
          name: 'Professional',
          badge: 'Popolare',
            desc: 'Per aziende e progetti enterprise',
          price: '999 /mese',
          features: '✅ Tutto di Starter + | ✅ Supabase configurato | ✅ Blockchain integration | ✅ Componenti premium | ✅ Deploy automation | ✅ Support prioritario | 🌟 Consulenza mensile inclusa',
          emailPlaceholder: 'your-email@company.com',
          button: 'Acquista Professional'
        },
        enterprise: {
          name: 'Enterprise',
          desc: 'Supporto dedicato FULL',
          price: 'Custom',
          features: '✅ Tutto di Professional + | ✅ Multi-tenant setup | ✅ Custom integrations | ✅ White-label branding | ✅ SLA garantito | ✅ Training team personale | 🎯 Sviluppo dedicato',
          button: 'Contatta Michele Miky Monti'
        },
        messages: {
          success: '✅ Richiesta registrata! Configura Supabase/Stripe per processare pagamenti reali.',
          error: '❌ Errore temporaneo. Riprova più tardi.'
        },
        featuresTitle: 'Cosa Ottieni con il Template',
        featuresSubtitle: 'Una soluzione enterprise completa con le migliori tecnologie del 2025',
        bonusTitle: '✨ Bonus Inclusi nel Template'
      }
    }
  },
  en: {
    common: {
      demoMode: 'Demo Mode',
      readPhilosophy: 'Read Philosophy',
      portfolio: 'Portfolio / Contact',
      getStarted: 'Get Started',
      features: 'Explore Features',
      pricing: 'Pricing',
      home: 'Home',
      signIn: 'Sign In',
      signOut: 'Sign Out',
    },
    footer: {
      brand: {
        title: '3ASYAPPS',
        tagline: 'Operations utilities for business',
        description1: 'Tools and applications to improve operational efficiency in companies.',
        description2: 'From whistleblowing compliance to AI-driven 3D generation, we build focused scalable solutions.'
      },
      templateSection: 'Template',
      ecosystemSection: 'Ecosystem',
      supportSection: 'Support',
      ecosystem: {
        whistle: '3ASYWHISTLE (Whistleblowing)',
        modeling: '3ASYMODELING (3D AI)',
        hr: '3ASYHR (HR Solutions)',
        channel: '3ASYCHANNELMANAGER (Channel Sync)'
      },
      links: {
        home: 'Home',
        pricing: 'Pricing',
        features: 'Features',
        githubRepo: 'GitHub Repository',
        issues: 'Report Issues',
        discussions: 'Discussions'
      },
      copyright: 'All rights reserved'
    },
    home: {
      badge: 'Professional React Template by Michele Miky Monti - www.3asy.app',
      hero: {
        title: '3ASYAPP Template',
        line1: 'The enterprise-grade template to build any web app you can imagine.',
        line2: 'React + TypeScript + Tailwind + Supabase + Blockchain ready. Everything configured and deployment-ready.'
      },
      cta: {
        primary: 'Get Started',
        secondary: 'Explore Features'
      },
      stack: {
        title: 'Enterprise Technology Stack',
        subtitle: 'Best-in-class technologies integrated and ready'
      },
      features: {
        title: 'Everything You Need',
        subtitle: 'Components, integrations and enterprise-ready configuration'
      },
      useCases: {
        title: 'Infinite Possibilities',
        subtitle: 'Examples of what you can build using this template'
      },
      curator: {
        title: 'Curated by Michele Miky Monti',
        description: 'Entrepreneur & Technology Generalist. Born from real projects: pragmatic patterns, optional complexity, demo mode by default. No buzzword bingo — just a clean base you can strip, extend and re-brand without friction.'
      },
      ethos: {
        demoFirst: 'Demo First',
        optionalComplexity: 'Optional Complexity',
        readablePatterns: 'Readable Patterns'
      },
      blockchain: {
        title: 'Blockchain Integration Demo',
        subtitle: 'Test Web3 connection instantly - no configuration needed'
      },
      ctaSection: {
        title: 'Ready to Build Your Web App?',
        subtitle: 'Save weeks of setup. Start immediately with production-grade code.'
      },
      credit: 'Template curated by',
      philosophyButton: 'Read Philosophy',
      portfolioButton: 'Portfolio / Contact'
    },
    pricing: {
      badge: 'Professional Template by Michele Miky Monti - www.3asy.app',
      title: '3ASYAPP Template License',
      subtitle: 'Get full access to an enterprise framework for ultra-performant web apps',
      plans: {
        starter: {
          name: 'Starter',
          desc: 'For personal projects & prototypes',
          price: 'ASK MIKY!',
          features: '✅ Full template | ✅ Base UI components | ✅ Vite/Tailwind configuration | ✅ TypeScript setup | ❌ Premium integrations | ❌ Emergency support',
          button: 'Tell me your idea'
        },
        professional: {
          name: 'Professional',
          badge: 'Popular',
          desc: 'For companies & serious products',
          price: '999 /month',
          features: '✅ Everything in Starter + | ✅ Supabase configured | ✅ Blockchain integration | ✅ Premium components | ✅ Deploy automation | ✅ Priority support | 🌟 Monthly consulting included',
          emailPlaceholder: 'your-email@company.com',
          button: 'Buy Professional'
        },
        enterprise: {
          name: 'Enterprise',
          desc: 'Full dedicated support',
          price: 'Custom',
          features: '✅ Everything in Professional + | ✅ Multi-tenant setup | ✅ Custom integrations | ✅ White-label branding | ✅ Guaranteed SLA | ✅ Team training | 🎯 Dedicated development',
          button: 'Contact Michele Miky Monti'
        },
        messages: {
          success: '✅ Request stored! Configure Supabase/Stripe to process real payments.',
          error: '❌ Temporary error. Please try again later.'
        },
        featuresTitle: 'What You Get with the Template',
        featuresSubtitle: 'A complete enterprise solution with the best 2025 technologies',
        bonusTitle: '✨ Bonus Included'
      }
    }
  }
}

export function getDictionary(locale: SupportedLocale) {
  return dictionaries[locale]
}

export function resolvePath(obj: Dictionary, path: string) {
  return path.split('.').reduce((acc: any, key) => (acc ? acc[key] : undefined), obj)
}
