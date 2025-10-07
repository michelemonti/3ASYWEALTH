import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { useUnifiedAuth } from './UnifiedAuthProvider'
import { Building2, User, LogOut } from 'lucide-react'
import { LocaleToggle, useLocale } from '@/locale/LocaleProvider'

export default function Header() {
  const { user, authMode, logout, isAuthenticated } = useUnifiedAuth()
  const { t } = useLocale()

  return (
    <header className="w-full py-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground">3ASYAPP</span>
            <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">Template</span>
            {authMode === 'azure' && (
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                <Building2 className="w-3 h-3 mr-1" />
                Enterprise
              </Badge>
            )}
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('common.home')}
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
            )}
            <Link to="/subscribe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('common.pricing')}
            </Link>
            <a 
              href="https://github.com/michelemonti/3ASYAPPS" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <LocaleToggle />
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {(user as any)?.name || (user as any)?.email}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-1" /> {t('common.signOut')}
              </Button>
            </div>
          ) : (
            <>
              <span className="hidden lg:block text-xs text-muted-foreground">
                by Michele Miky Monti
              </span>
              <Button asChild size="sm" variant="outline">
                <Link to="/login">{t('common.signIn')}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/subscribe">{t('common.getStarted')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
