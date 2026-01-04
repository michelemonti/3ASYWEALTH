/**
 * Navigation Component
 * 
 * Professional top navigation bar with page tabs, 
 * theme toggle and language switcher
 * 
 * Part of the 3ASU.APP Suite
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Home, Table, PieChart, Info, Menu, X } from 'lucide-react'

export function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const tabs = [
    { path: '/', label: t('app.nav.home'), icon: Home },
    { path: '/assets', label: t('app.nav.assets'), icon: Table },
    { path: '/summary', label: t('app.nav.summary'), icon: PieChart },
    { path: '/about', label: t('app.nav.about'), icon: Info },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    setMobileMenuOpen(false)
  }

  return (
    <nav className="border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo */}
          <div className="flex items-center gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => navigate('/')}
            >
              {/* Logo */}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-shadow">
                  <span className="text-white font-bold text-sm">3W</span>
                </div>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent leading-tight">
                3ASYWEALTH
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 ml-6">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.path}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => handleNavigate(tab.path)}
                    className={`
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-md' 
                        : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Right side - Theme, Language, Mobile Menu */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/40 pt-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.path}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => handleNavigate(tab.path)}
                    className={`
                      justify-start w-full
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                        : 'text-foreground/70 hover:text-foreground hover:bg-accent'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
