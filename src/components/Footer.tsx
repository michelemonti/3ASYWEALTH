/**
 * Footer Component
 * 
 * Global footer with template attribution and licensing info
 * 
 * @author Michele Miky Monti (Template: 3ASYAPP by Miky)
 * @version 1.0.0
 */

import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-2">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">3ASYWEALTH</span> • {' '}
            <a href="https://github.com/michelemonti/3asywealth" className="text-blue-400 hover:text-blue-300 transition-colors">
              GitHub
            </a>
          </p>
          
          <p className="text-xs text-slate-500">
            Template 3ASYAPP by Michele Miky Monti • MIT License • Privacy-First Design
          </p>
        </div>
      </div>
    </footer>
  )
}