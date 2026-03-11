/**
 * Footer Component
 * 
 * Professional footer with suite branding and links
 * Part of the 3ASU.APP Suite
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { useTranslation } from 'react-i18next'
import { Github, Twitter, Heart, Shield } from 'lucide-react'

export function Footer() {
  const { t } = useTranslation()
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: Github, href: 'https://github.com/michelemonti/3asywealth', label: 'GitHub' },
    { icon: Twitter, href: 'https://twitter.com/michelemonti3D', label: 'Twitter' },
  ]
  
  return (
    <footer className="border-t border-border/40 bg-background/95 backdrop-blur-sm mt-auto">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">3W</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">3ASYWEALTH</h3>
                <p className="text-xs text-muted-foreground">
                  Part of the <a href="https://www.3asy.app" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">3ASY.APP</a> Suite
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-md">
              {t('footer.description', 'Your personal wealth tracking solution with 100% privacy. No servers, no accounts, no data collection. Your financial data stays yours.')}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  aria-label={link.label}
                >
                  <link.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Trust & Privacy */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              {t('footer.privacy_title', 'Privacy First')}
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                {t('footer.privacy_1', 'No server storage')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                {t('footer.privacy_2', 'No account required')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                {t('footer.privacy_3', 'Data stays local')}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600 dark:bg-green-400"></span>
                {t('footer.privacy_4', 'Open source')}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>© {currentYear}</span>
              <a 
                href="https://www.3asy.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                3ASY.APP
              </a>
              <span>• Made with</span>
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>by</span>
              <a 
                href="https://github.com/michelemonti" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Miky Monti
              </a>
            </div>
            <div className="flex items-center gap-4">
              <span>MIT License</span>
              <a 
                href="https://github.com/michelemonti/3asywealth" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
                Source Code
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}