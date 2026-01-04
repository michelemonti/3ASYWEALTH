import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { 
  Shield, 
  Sparkles,
  Database,
  ChevronDown,
  Star,
  Zap,
  Globe,
  CheckCircle2,
  ArrowRight,
  Lock,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const features = [
    {
      icon: Shield,
      titleKey: 'landing.features.privacy.title',
      descKey: 'landing.features.privacy.description',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Database,
      titleKey: 'landing.features.import_export.title', 
      descKey: 'landing.features.import_export.description',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: Zap,
      titleKey: 'landing.features.views.title',
      descKey: 'landing.features.views.description', 
      color: 'from-purple-500 to-pink-600'
    }
  ];

  const stats = [
    { value: '100%', label: 'Privacy', icon: Lock },
    { value: '0', label: 'Servers', icon: Database },
    { value: '∞', label: 'Free Forever', icon: Star },
  ];

  const faqItems = [
    {
      questionKey: 'landing.faq.q1.question',
      answerKey: 'landing.faq.q1.answer'
    },
    {
      questionKey: 'landing.faq.q2.question', 
      answerKey: 'landing.faq.q2.answer'
    },
    {
      questionKey: 'landing.faq.q5.question',
      answerKey: 'landing.faq.q5.answer'
    },
    {
      questionKey: 'landing.faq.q6.question',
      answerKey: 'landing.faq.q6.answer'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/80 to-slate-900 text-white">
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-purple-500/5 to-transparent rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Privacy Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-300 px-5 py-2.5 rounded-full text-sm font-medium mb-8 backdrop-blur-sm">
              <Shield className="w-4 h-4" />
              {t('landing.hero.badge')}
            </div>
            
            {/* Main Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                3ASYWEALTH
              </span>
            </h1>
            
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-white">
              {t('landing.hero.title')}
            </h2>
            
            <p className="text-lg md:text-xl text-slate-200 mb-12 leading-relaxed max-w-3xl mx-auto" 
               dangerouslySetInnerHTML={{ __html: t('landing.hero.subtitle') }}>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                onClick={() => navigate('/assets')}
                className="text-lg px-10 py-7 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-2xl shadow-purple-500/30 transform hover:scale-105 transition-all duration-300 rounded-xl font-semibold"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                {t('landing.hero.cta_primary')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-lg px-8 py-7 border-slate-500/50 text-slate-200 hover:bg-slate-800/50 backdrop-blur-sm rounded-xl"
              >
                {t('landing.hero.cta_secondary')}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-2xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/30">
                  <stat.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                  <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2.5 rounded-full backdrop-blur-sm border border-slate-600/50 hover:border-green-500/50 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-white">{t('landing.hero.badge_privacy')}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2.5 rounded-full backdrop-blur-sm border border-slate-600/50 hover:border-blue-500/50 transition-colors">
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-white">{t('landing.hero.badge_opensource')}</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/70 px-4 py-2.5 rounded-full backdrop-blur-sm border border-slate-600/50 hover:border-yellow-500/50 transition-colors">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-white">{t('landing.hero.badge_free')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-800/30 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-medium text-primary mb-4 tracking-wider uppercase">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t('landing.features.title')}
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/10">
                  <CardContent className="p-8 text-center">
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 mt-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works - Compact Version */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-white">
              {t('landing.howItWorks.title')}
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="relative">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-6 shadow-lg shadow-purple-500/25">
                      {step}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {t(`landing.howItWorks.step${step}.title`)}
                    </h3>
                    <p className="text-slate-300 leading-relaxed" 
                       dangerouslySetInnerHTML={{ __html: t(`landing.howItWorks.step${step}.description`) }}>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section with Accordion */}
      <div className="py-20 bg-slate-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {t('landing.faq.title')}
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors duration-200"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {t(item.questionKey)}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6">
                    <div className="pt-4 border-t border-slate-700/50">
                      <p className="text-slate-300 leading-relaxed" 
                         dangerouslySetInnerHTML={{ __html: t(item.answerKey) }}>
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA - Enhanced */}
      <div className="py-20 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-900/20 via-transparent to-emerald-900/20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Card className="max-w-5xl mx-auto bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-green-500/10 relative overflow-hidden">
            {/* Card background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-emerald-500/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"></div>
            
            <CardContent className="p-16 relative z-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  Ready in seconds
                </div>
                
                <h2 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                    {t('landing.cta.title')}
                  </span>
                </h2>
                
                <p className="text-2xl text-slate-200 mb-10 leading-relaxed max-w-3xl mx-auto font-light" 
                   dangerouslySetInnerHTML={{ __html: t('landing.cta.subtitle') }}>
                </p>
              </div>
              
              <div className="space-y-6">
                <Button 
                  size="lg"
                  onClick={() => navigate('/assets')}
                  className="text-xl px-16 py-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 border-0 shadow-2xl shadow-green-500/30 transform hover:scale-110 transition-all duration-500 font-semibold rounded-2xl"
                >
                  <Sparkles className="mr-3 h-6 w-6" />
                  {t('landing.cta.button')}
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
                
                <p className="text-slate-400 mt-4 text-lg">
                  {t('landing.cta.note')}
                </p>
                
                {/* Trust indicators */}
                <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm">
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                    No credit card required
                  </div>
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                    No personal data collected
                  </div>
                  <div className="flex items-center gap-2 text-green-300">
                    <CheckCircle2 className="w-4 h-4" />
                    Start in 10 seconds
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}