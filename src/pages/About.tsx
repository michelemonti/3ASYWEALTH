/**
 * About Page
 * 
 * Information, FAQ, transparency, and trust-building content
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield,
  Lock,
  Code,
  Github,
  Heart,
  Zap,
  Globe,
  Database,
  Eye,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Sparkles,
  AlertCircle
} from 'lucide-react'

export default function About() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const features = [
    {
      icon: Shield,
      titleKey: 'about.features.privacy.title',
      descKey: 'about.features.privacy.description',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Lock,
      titleKey: 'about.features.noAccount.title',
      descKey: 'about.features.noAccount.description',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Code,
      titleKey: 'about.features.opensource.title',
      descKey: 'about.features.opensource.description',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Zap,
      titleKey: 'about.features.free.title',
      descKey: 'about.features.free.description',
      color: 'from-amber-500 to-orange-600'
    }
  ]

  const faqItems = [
    {
      question: 'about.faq.dataSaving.question',
      answer: 'about.faq.dataSaving.answer',
      icon: Database
    },
    {
      question: 'about.faq.multiDevice.question',
      answer: 'about.faq.multiDevice.answer',
      icon: Globe
    },
    {
      question: 'about.faq.safety.question',
      answer: 'about.faq.safety.answer',
      icon: Shield
    },
    {
      question: 'about.faq.free.question',
      answer: 'about.faq.free.answer',
      icon: Heart
    },
    {
      question: 'about.faq.features.question',
      answer: 'about.faq.features.answer',
      icon: Sparkles
    },
    {
      question: 'about.faq.dataSecurity.question',
      answer: 'about.faq.dataSecurity.answer',
      icon: Lock
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-background dark:via-background dark:to-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            {t('about.hero.badge')}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            {t('about.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('about.hero.subtitle')}
          </p>
          
          {/* Suite Banner */}
          <div className="mt-8 inline-flex items-center gap-2 bg-card border border-border px-6 py-3 rounded-full text-sm">
            <span className="text-muted-foreground">Part of</span>
            <a href="https://www.3asy.app" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
              3ASY.APP Suite
            </a>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="border border-border bg-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-6">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Open Source Challenge */}
        <Card className="mb-16 border border-purple-500/20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <Code className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-foreground">{t('about.opensource.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('about.opensource.description')}
            </p>
            
            <div className="bg-card rounded-lg p-6 border border-border">
              <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-foreground">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                {t('about.opensource.challenge.title')}
              </h4>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {t('about.opensource.challenge.description')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md"
                  onClick={() => window.open('https://github.com/michelemonti/3asywealth', '_blank')}
                >
                  <Github className="w-5 h-5 mr-2" />
                  {t('about.opensource.viewCode')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="outline"
                  className="border border-purple-300 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/50"
                  onClick={() => window.open('https://github.com/michelemonti/3asywealth/issues', '_blank')}
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {t('about.opensource.reportIssue')}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <h5 className="font-semibold mb-1 text-foreground">{t('about.opensource.benefits.transparent')}</h5>
                <p className="text-sm text-muted-foreground">{t('about.opensource.benefits.transparentDesc')}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <h5 className="font-semibold mb-1 text-foreground">{t('about.opensource.benefits.auditable')}</h5>
                <p className="text-sm text-muted-foreground">{t('about.opensource.benefits.auditableDesc')}</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
                <h5 className="font-semibold mb-1 text-foreground">{t('about.opensource.benefits.community')}</h5>
                <p className="text-sm text-muted-foreground">{t('about.opensource.benefits.communityDesc')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-16 shadow-xl">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              {t('about.faq.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {faqItems.map((item, index) => {
                const Icon = item.icon
                const isOpen = openFaq === index
                return (
                  <div key={index} className="border-2 border-border rounded-lg overflow-hidden hover:border-purple-500/50 transition-colors">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-lg text-foreground">
                          {t(item.question)}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-t-2 border-border">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {t(item.answer)}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technical Stack */}
        <Card className="mb-16 border border-blue-500/20 shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-3 text-foreground">
              <Code className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              {t('about.technical.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {t('about.technical.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-900">
                <h5 className="font-semibold mb-2 text-blue-800 dark:text-blue-300">{t('about.technical.frontend')}</h5>
                <p className="text-sm text-muted-foreground">React 18, TypeScript, Tailwind CSS, Recharts</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-900">
                <h5 className="font-semibold mb-2 text-purple-800 dark:text-purple-300">{t('about.technical.storage')}</h5>
                <p className="text-sm text-muted-foreground">Browser localStorage (100% local)</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-900">
                <h5 className="font-semibold mb-2 text-green-800 dark:text-green-300">{t('about.technical.export')}</h5>
                <p className="text-sm text-muted-foreground">CSV, JSON, PDF (jsPDF + html2canvas)</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-900">
                <h5 className="font-semibold mb-2 text-amber-800 dark:text-amber-300">{t('about.technical.i18n')}</h5>
                <p className="text-sm text-muted-foreground">English, Italiano, Español</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">{t('about.cta.title')}</h2>
          <p className="text-xl mb-8 opacity-90">{t('about.cta.subtitle')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-purple-700 hover:bg-white/90 shadow-lg font-semibold"
              onClick={() => navigate('/assets')}
            >
              <Zap className="w-5 h-5 mr-2" />
              {t('about.cta.start')}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
              onClick={() => window.open('https://github.com/michelemonti/3asywealth', '_blank')}
            >
              <Github className="w-5 h-5 mr-2" />
              {t('about.cta.github')}
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
