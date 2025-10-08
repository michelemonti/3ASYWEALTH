import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { 
  Shield, 
  Download, 
  Upload, 
  Lock, 
  Eye, 
  FileJson, 
  TrendingUp,
  PieChart,
  Table,
  Sparkles,
  Database,
  ChevronDown,
  Star,
  Zap,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            100% Privacy - Zero Data Collection
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              3ASYWEALTH
            </span>
            <br />
            Il Tuo Patrimonio, Solo Tuo
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Gestisci i tuoi asset finanziari con la massima privacy.<br />
            Nessun server. Nessun account. Nessuna registrazione.<br />
            <span className="font-semibold text-gray-800">I tuoi dati rimangono nel tuo browser.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate('/assets')}
              className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Inizia Subito (Gratis)
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-lg px-8 py-6"
            >
              Come Funziona
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Lock className="w-4 h-4 text-green-600" />
              <span className="text-gray-700 font-medium">100% Privacy</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 font-medium">Open Source</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-gray-700 font-medium">Sempre Gratis</span>
            </div>
          </div>
        </div>

        {/* Privacy First Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-green-600 p-3 rounded-lg">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Perché Nessuna Registrazione?
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                  Lo sappiamo: <span className="font-semibold">nessuno vuole condividere i propri dati finanziari</span>. 
                  E avete ragione. Il vostro patrimonio sono affari vostri.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Per questo 3ASYWEALTH funziona <span className="font-semibold">interamente nel tuo browser</span>. 
                  Non c'è nessun server che riceve i tuoi dati. Non c'è nessun database. 
                  Non c'è nessun account. Non c'è nessuna registrazione.<br />
                  <span className="text-green-700 font-bold">Zero dati condivisi. Zero tracciamento. Zero compromessi.</span>
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* How It Works */}
        <div id="how-it-works" className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Come Funziona
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Table className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                1. Inserisci i Tuoi Asset
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Aggiungi partecipazioni, immobili, beni personali e liquidità. 
                Tutto viene salvato <span className="font-semibold">solo nel tuo browser</span> (localStorage).
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <PieChart className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                2. Visualizza & Analizza
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Vedi il totale, la ripartizione per categoria e grafici interattivi. 
                Capisci dove è concentrata la tua ricchezza.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                3. Esporta Quando Vuoi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Scarica i tuoi dati in CSV o JSON. Conservali sul tuo PC, cloud personale, 
                o chiavetta USB. <span className="font-semibold">Sono tuoi, per sempre.</span>
              </p>
            </Card>
          </div>
        </div>

        {/* Import/Export Philosophy */}
        <div className="max-w-5xl mx-auto mb-20">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
            <div className="text-center mb-8">
              <div className="flex justify-center gap-4 mb-6">
                <div className="bg-blue-600 p-4 rounded-lg">
                  <FileJson className="w-8 h-8 text-white" />
                </div>
                <div className="bg-indigo-600 p-4 rounded-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Torna Quando Vuoi
              </h3>
              <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
                Hai esportato i tuoi dati 6 mesi fa? Nessun problema.<br />
                <span className="font-semibold">Importa il file CSV o JSON e riparti da dove avevi lasciato.</span>
                <br /><br />
                Cambi dispositivo? Esporta su un PC e importa su un altro.<br />
                Vuoi fare un backup? Salva il file sul tuo cloud personale (Google Drive, Dropbox, iCloud...).<br />
                <span className="text-blue-700 font-bold">I tuoi dati viaggiano con te, non attraverso i nostri server.</span>
              </p>
            </div>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Funzionalità Principali
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Gestione Completa Asset</h4>
                  <p className="text-gray-600 text-sm">
                    CRUD completo per Partecipazioni, Immobili, Beni personali e Liquidità
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <PieChart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Grafici Interattivi</h4>
                  <p className="text-gray-600 text-sm">
                    Visualizza ripartizione con grafici a torta e barre
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Download className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Import/Export CSV/JSON</h4>
                  <p className="text-gray-600 text-sm">
                    Portabilità totale dei dati, compatibile con Excel/Google Sheets
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Shield className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Privacy Assoluta</h4>
                  <p className="text-gray-600 text-sm">
                    Tutto in localStorage del browser, nessun dato lascia il tuo dispositivo
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Vista Tabella & Sintesi</h4>
                  <p className="text-gray-600 text-sm">
                    Doppia visualizzazione: dettaglio riga per riga o overview con totali
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Dati Demo Inclusi</h4>
                  <p className="text-gray-600 text-sm">
                    Carica dataset di esempio per provare l'app immediatamente
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Domande Frequenti
          </h2>
          
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                💡 Come funziona il salvataggio dei dati?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Tutto viene salvato nel <span className="font-semibold">localStorage del tuo browser</span>. 
                È come un mini-database locale che funziona solo sul tuo dispositivo. 
                I dati rimangono anche se chiudi il browser, ma sono <span className="font-semibold">accessibili solo a te</span>.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                🔄 Posso usare 3ASYWEALTH su più dispositivi?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Sì! Esporta i tuoi dati in CSV o JSON su un dispositivo, 
                poi importali sull'altro. Puoi anche salvare il file su un cloud personale 
                (Google Drive, iCloud, Dropbox) per averlo sempre sincronizzato.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                🗑️ Cosa succede se cancello i dati del browser?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Se cancelli i dati di navigazione (cache, localStorage), <span className="font-semibold">perderai i tuoi asset</span>. 
                Per questo è importante <span className="text-green-600 font-bold">esportare regolarmente</span> un backup 
                in CSV o JSON e salvarlo in un posto sicuro.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                📊 Posso usare Excel con i file esportati?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Assolutamente! Il formato CSV è perfettamente compatibile con Excel, 
                Google Sheets, Numbers e qualsiasi altro foglio di calcolo. 
                Puoi fare analisi avanzate, grafici personalizzati o semplicemente tenere un backup leggibile.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                🔐 È davvero sicuro? Come posso essere sicuro?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                3ASYWEALTH è <span className="font-semibold">open source</span>! 
                Puoi controllare il codice su <a href="https://github.com/michelemonti/3asywealth" className="text-blue-600 hover:underline">GitHub</a>. 
                Non c'è nessuna chiamata a server esterni. Puoi aprire gli strumenti del browser (F12) 
                e vedere nella tab Network che <span className="font-bold">non viene inviata nessuna richiesta</span> quando inserisci i tuoi dati.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="font-bold text-gray-900 mb-2 text-lg">
                💰 È davvero gratis?
              </h4>
              <p className="text-gray-600 leading-relaxed">
                Sì, completamente gratis. Nessun costo nascosto, nessun piano premium, nessuna carta di credito richiesta. 
                È un progetto <span className="font-semibold">open source (MIT License)</span> creato per chi vuole privacy e semplicità.
              </p>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Pronto a Riprendere il Controllo?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Nessun account. Nessuna carta di credito. Nessun dato condiviso.<br />
              <span className="text-green-400 font-semibold">Solo tu e il tuo patrimonio.</span>
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/assets')}
              className="text-lg px-12 py-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Inizia Ora - È Gratis
            </Button>
            <p className="text-sm text-gray-400 mt-4">
              Funziona su Chrome, Firefox, Safari, Edge - Nessuna installazione richiesta
            </p>
          </Card>
        </div>
      </div>

      {/* Footer Note */}
      <div className="border-t border-gray-200 bg-gray-50 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">
            <span className="font-semibold">3ASYWEALTH</span> - Open Source • MIT License • 
            <a href="https://github.com/michelemonti/3asywealth" className="text-blue-600 hover:underline ml-1">
              GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
