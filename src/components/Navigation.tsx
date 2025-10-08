/**
 * Navigation Component
 * 
 * Top navigation bar with page tabs and language switcher
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Home, BarChart3, Table, PieChart } from 'lucide-react'

export function Navigation() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()

  const tabs = [
    { path: '/', label: t('app.nav.home'), icon: Home },
    { path: '/assets', label: t('app.nav.assets'), icon: Table },
    { path: '/summary', label: t('app.nav.summary'), icon: PieChart },
  ]

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Tabs */}
          <div className="flex items-center gap-6">
            <div 
              className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              3ASYWEALTH
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              {tabs.map((tab) => {
                const isActive = location.pathname === tab.path
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.path}
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => navigate(tab.path)}
                    className={isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'text-gray-800 hover:text-gray-900 hover:bg-gray-100'}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Right side - Language Switcher */}
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile tabs - shown below on small screens */}
        <div className="md:hidden mt-3 flex items-center gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <Button
                key={tab.path}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(tab.path)}
                className={`flex-shrink-0 ${isActive ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'text-gray-800 hover:text-gray-900 hover:bg-gray-100'}`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
