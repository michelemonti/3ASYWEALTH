import { useState } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLocale } from '@/locale/LocaleProvider'

export default function Subscribe() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const { t } = useLocale()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      // Placeholder for Supabase Edge Function call e.g. create-checkout or subscribe
      await new Promise(r => setTimeout(r, 600))
      setMessage(t('pricing.plans.messages.success'))
    } catch (e) {
      setMessage(t('pricing.plans.messages.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-6 bg-green-100 text-green-700 border-green-200">
            {t('pricing.badge')}
          </Badge>
          <h1 className="text-4xl font-bold text-green-800 mb-6">
            {t('pricing.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('pricing.subtitle')}
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <Card className="text-center border-2 hover:border-primary/50 transition-colors h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{t('pricing.plans.starter.name')}</CardTitle>
                <CardDescription>{t('pricing.plans.starter.desc')}</CardDescription>
                <div className="text-3xl font-bold text-foreground mt-4">{t('pricing.plans.starter.price')}</div>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {t('pricing.plans.starter.features').split('|').map((f: string, idx: number) => {
                    const trimmed = f.trim()
                    const isNegative = trimmed.startsWith('❌')
                    const content = trimmed.replace(/^✅ |^❌ /, '')
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={isNegative ? 'text-red-500' : 'text-green-600'}>{isNegative ? '❌' : '✅'}</span>
                        <span>{content}</span>
                      </div>
                    )
                  })}

                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full" disabled>
                  {t('pricing.plans.starter.button')}
                </Button>
              </CardFooter>
            </Card>

            {/* Professional Plan */}
            <Card className="text-center border-2 border-green-500 relative bg-green-50/30 h-full flex flex-col">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-green-600 text-white">{t('pricing.plans.professional.badge')}</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl text-green-800">{t('pricing.plans.professional.name')}</CardTitle>
                <CardDescription>{t('pricing.plans.professional.desc')}</CardDescription>
                <div className="text-3xl font-bold text-green-700 mt-4">{t('pricing.plans.professional.price').split(' ')[0]}<span className="text-base text-muted-foreground"> {t('pricing.plans.professional.price').split(' ')[1] || ''}</span></div>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {t('pricing.plans.professional.features').split('|').map((f: string, idx: number) => {
                    const trimmed = f.trim()
                    const icon = trimmed.startsWith('🌟') ? '🌟' : '✅'
                    const clean = trimmed.replace(/^🌟 |^✅ /, '')
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={icon === '🌟' ? 'text-yellow-500' : 'text-green-600'}>{icon}</span>
                        <span>{clean}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <form onSubmit={handleSubmit} className="w-full space-y-4">
                  <Input
                    type="email"
                    placeholder={t('pricing.plans.professional.emailPlaceholder')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                    {loading ? '...' : t('pricing.plans.professional.button')}
                  </Button>
                </form>
              </CardFooter>
            </Card>

            {/* Enterprise Plan */}
            <Card className="text-center border-2 hover:border-green-300 transition-colors h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800">{t('pricing.plans.enterprise.name')}</CardTitle>
                <CardDescription>{t('pricing.plans.enterprise.desc')}</CardDescription>
                <div className="text-3xl font-bold text-green-700 mt-4">{t('pricing.plans.enterprise.price')}</div>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                <div className="space-y-2 text-sm text-muted-foreground">
                  {t('pricing.plans.enterprise.features').split('|').map((f: string, idx: number) => {
                    const trimmed = f.trim()
                    const icon = trimmed.startsWith('🎯') ? '🎯' : '✅'
                    const clean = trimmed.replace(/^🎯 |^✅ /, '')
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={icon === '🎯' ? 'text-amber-500' : 'text-green-600'}>{icon}</span>
                        <span>{clean}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                  {t('pricing.plans.enterprise.button')}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Feedback Message */}
          {message && (
            <div className="mt-8 text-center">
              <Card className="max-w-md mx-auto">
                <CardContent className="pt-6">
                  <p className="text-sm">{message}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Features List */}
      <section className="py-20 px-6 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-950/20 dark:to-blue-950/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-green-100 text-green-700 border-green-200">
              🚀 {t('pricing.plans.featuresTitle')}
            </Badge>
            <h2 className="text-3xl font-bold text-foreground mb-6">
              {t('pricing.plans.featuresTitle')}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t('pricing.plans.featuresSubtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="relative overflow-hidden border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
                <h3 className="font-bold text-foreground mb-6 text-lg">Frontend Moderno</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">React 18 + TypeScript + Vite</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Tailwind CSS + Shadcn/UI</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Light/Dark theme system</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Mobile-first responsive</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🗄️</div>
                <h3 className="font-bold text-foreground mb-6 text-lg">Backend Enterprise</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Supabase PostgreSQL + Auth</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Edge Functions serverless</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Real-time subscriptions</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Row-level security (RLS)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">⛓️</div>
                <h3 className="font-bold text-foreground mb-6 text-lg">Blockchain Ready</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Ethers.js v6 integration</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">MetaMask wallet connection</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Smart contracts deployment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Gas optimization patterns</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
              <CardContent className="p-8">
                <div className="text-4xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
                <h3 className="font-bold text-foreground mb-6 text-lg">DevOps Automation</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Vercel deploy ottimizzato</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">GitHub Actions CI/CD</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Environment management</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0"></div>
                    <span className="text-muted-foreground">Performance monitoring</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Features Banner */}
          <div className="mt-16 text-center">
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-0 text-white">
              <CardContent className="py-10 px-8">
                <h3 className="text-xl font-bold mb-6">{t('pricing.plans.bonusTitle')}</h3>
                <div className="grid md:grid-cols-3 gap-8 text-sm">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-yellow-300 text-lg">🎯</span>
                    <span>AI Integration pronta (OpenAI API)</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-yellow-300 text-lg">🔐</span>
                    <span>Azure AD + Supabase Auth</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-yellow-300 text-lg">📱</span>
                    <span>PWA Ready + Offline Support</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Developer Credit */}
      <section className="py-8 px-4">
        <div className="container mx-auto text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {t('home.credit')}<br/>
                <strong className="text-foreground">Michele Miky Monti</strong>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
