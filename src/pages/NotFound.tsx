import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Navigation } from '@/components/Navigation'  
import { Button } from '@/components/ui/button'
import { Home, Table, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-4 py-24">
        <div className="text-center max-w-lg animate-fade-in">
          {/* Animated 404 */}
          <div className="relative mb-8">
            <h1 className="text-7xl sm:text-8xl lg:text-[10rem] font-black leading-none bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 bg-clip-text text-transparent select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/25 animate-pulse-slow">
                <span className="text-white font-bold text-3xl">?</span>
              </div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {t('notFound.title')}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t('notFound.subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Home className="w-4 h-4 mr-2" />
              {t('notFound.goHome')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/assets')}
            >
              <Table className="w-4 h-4 mr-2" />
              {t('notFound.goAssets')}
            </Button>
            <Button 
              variant="ghost"
              onClick={() => navigate(-1 as unknown as string)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
