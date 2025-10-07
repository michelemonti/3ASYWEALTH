import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { 
  Globe, 
  Shield, 
  Zap, 
  Cloud, 
  Database, 
  Code2, 
  Sparkles, 
  Rocket,
  Building2,
  Users,
  BarChart3,
  Settings,
  FileText,
  ShoppingCart,
  MessageSquare,
  Calendar,
  ArrowRight,
  Star,
  Wallet
} from 'lucide-react'
import { isDemoModeEnabled } from '@/lib/config'
import { useLocale } from '@/locale/LocaleProvider'

export default function Home() {
  const isDemo = isDemoModeEnabled()
  const { t } = useLocale()
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-6 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            {isDemo && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('common.demoMode')}</Badge>
            )}
          </div>
          <Badge className="mb-6 bg-green-100 text-green-700 border-green-200 hover:bg-green-200 transition-colors animate-scale-in">
            {t('home.badge')}
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-green-600 via-blue-600 to-green-600 bg-clip-text text-transparent animate-slide-up">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed animate-slide-up" style={{animationDelay: '0.1s'}}>
            {t('home.hero.line1')}
          </p>
          <p className="text-lg text-muted-foreground mb-12 animate-slide-up" style={{animationDelay: '0.2s'}}>
            {t('home.hero.line2')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <Link to="/subscribe">
              <Button size="lg" className="px-8 py-4 text-lg hover:scale-105 transition-transform bg-green-600 hover:bg-green-700">
                {t('home.cta.primary')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg hover:scale-105 transition-transform border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})}
            >
              {t('home.cta.secondary')}
            </Button>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 px-6 bg-green-50/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in text-green-800">{t('home.stack.title')}</h2>
          <p className="text-muted-foreground mb-12 text-lg animate-fade-in">
            {t('home.stack.subtitle')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'React 18', icon: '⚛️', color: 'bg-blue-500' },
              { name: 'TypeScript', icon: '📘', color: 'bg-blue-600' },
              { name: 'Tailwind CSS', icon: '🎨', color: 'bg-cyan-500' },
              { name: 'Supabase', icon: '⚡', color: 'bg-green-500' },
              { name: 'Vite', icon: '⚡', color: 'bg-purple-500' },
              { name: 'Vercel', icon: '🚀', color: 'bg-black' }
            ].map((tech, index) => (
              <Card 
                key={tech.name} 
                className="p-4 text-center hover:shadow-lg transition-all hover:scale-105 animate-fade-in border-green-100"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-12 h-12 ${tech.color} rounded-lg flex items-center justify-center mx-auto mb-3 text-white text-xl`}>
                  {tech.icon}
                </div>
                <p className="font-medium">{tech.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-green-800">{t('home.features.title')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('home.features.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code2,
                title: "Full Stack Ready",
                description: "Frontend React, Backend Supabase, Database PostgreSQL, Auth completa, Edge Functions"
              },
              {
                icon: Shield,
                title: "Security First",
                description: "Row Level Security, JWT tokens, rate limiting, input validation, HTTPS enforced"
              },
              {
                icon: Zap,
                title: "Performance Optimized",
                description: "Vite build system, code splitting, lazy loading, CDN delivery, caching strategies"
              },
              {
                icon: Cloud,
                title: "Cloud Native",
                description: "Vercel deployment, serverless functions, edge computing, global CDN"
              },
              {
                icon: Database,
                title: "Real-time Database",
                description: "PostgreSQL con real-time subscriptions, migrations automatiche, backup"
              },
              {
                icon: Globe,
                title: "Blockchain Ready",
                description: "Web3 integration, MetaMask support, smart contracts deployment, DeFi ready"
              }
            ].map((feature, index) => (
              <Card 
                key={feature.title} 
                className="p-6 hover:shadow-xl transition-all hover:scale-105 animate-slide-up border-green-100 hover:border-green-200"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 px-6 bg-green-50/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-green-800">{t('home.useCases.title')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('home.useCases.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "CRM Enterprise", desc: "Gestione clienti, pipeline, analytics" },
              { icon: ShoppingCart, title: "E-commerce", desc: "Shop online, pagamenti, inventario" },
              { icon: BarChart3, title: "Analytics Dashboard", desc: "Metriche, KPI, reporting avanzato" },
              { icon: Users, title: "HR Management", desc: "Gestione dipendenti, payroll, recruiting" },
              { icon: FileText, title: "Document Manager", desc: "Archiviazione, workflow, collaboration" },
              { icon: MessageSquare, title: "Support Platform", desc: "Ticket system, chat, knowledge base" },
              { icon: Calendar, title: "Event Management", desc: "Organizzazione eventi, prenotazioni" },
              { icon: Settings, title: "Workflow Engine", desc: "Automazioni, processi, integrations" }
            ].map((useCase, index) => (
              <Card 
                key={useCase.title} 
                className="p-4 text-center hover:shadow-lg transition-all hover:scale-105 group animate-fade-in border-green-100"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <CardContent className="pt-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
                    <useCase.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{useCase.title}</h3>
                  <p className="text-sm text-muted-foreground">{useCase.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="bg-card p-8 rounded-2xl shadow-lg border-2 border-green-100">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-green-800">{t('home.curator.title')}</h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t('home.curator.description')}
            </p>
            {/* New concise ethos badges replacing the previous self-promotional set */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              <Badge variant="outline" className="border-green-200 text-green-700">{t('home.ethos.demoFirst')}</Badge>
              <Badge variant="outline" className="border-green-200 text-green-700">{t('home.ethos.optionalComplexity')}</Badge>
              <Badge variant="outline" className="border-green-200 text-green-700">{t('home.ethos.readablePatterns')}</Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline"
                className="border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => window.open('https://github.com/michelemonti/3ASYAPPS/blob/main/%233ASYAPP%20-%20TEMPLATE/docs/PHILOSOPHY.md','_blank')}
              >
                {t('home.philosophyButton')}
              </Button>
              <Button 
                variant="ghost"
                className="text-green-700 hover:bg-green-50"
                onClick={() => window.open('https://www.michelemonti.me','_blank')}
              >
                {t('home.portfolioButton')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 text-green-800">{t('home.blockchain.title')}</h2>
            <p className="text-xl text-muted-foreground">
              {t('home.blockchain.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                <h3 className="text-xl font-semibold mb-4 text-green-800">✅ Features Incluse</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>MetaMask wallet connection</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Real-time ETH balance display</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Smart contract interaction ready</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Multi-network support (Ethereum, Polygon)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Transaction management hooks</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  💡 <strong>Developer Note:</strong> Install MetaMask extension e configura il tuo contratto nell'environment per interazioni complete.
                </p>
              </div>
            </div>
            
            <div className="flex justify-center">
              <div className="w-full max-w-sm">
                {/* Placeholder for blockchain component */}
                <Card className="p-6 text-center border-2 border-green-200">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Blockchain Component</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Live wallet connection widget ready to use
                  </p>
                  <Badge className="bg-green-100 text-green-700">
                    Import BlockchainIntegration component
                  </Badge>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Rocket className="h-16 w-16 text-green-600 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6 text-green-800">{t('home.ctaSection.title')}</h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('home.ctaSection.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/subscribe">
              <Button size="lg" className="px-8 py-4 text-lg hover:scale-105 transition-transform bg-green-600 hover:bg-green-700">
                {t('home.cta.primary')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg hover:scale-105 transition-transform border-green-200 text-green-700 hover:bg-green-50"
              onClick={() => window.open('https://github.com/michelemonti/', '_blank')}
            >
              GitHub
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
