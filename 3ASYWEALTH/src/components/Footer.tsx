import { Link } from 'react-router-dom'
import { useLocale } from '@/locale/LocaleProvider'

export default function Footer() {
  const { t, locale } = useLocale()
  const year = new Date().getFullYear()
  return (
    <footer className="w-full py-14 border-t bg-gradient-to-b from-background to-muted/40 mt-20">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-5 gap-10">
          {/* Brand / Vision */}
          <div className="md:col-span-2">
            <h3 className="font-semibold text-2xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
              {t('footer.brand.title')}
            </h3>
            <p className="text-sm font-medium text-foreground mb-2">{t('footer.brand.tagline')}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              {t('footer.brand.description1')}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {t('footer.brand.description2')}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="uppercase tracking-wider text-[10px] border px-2 py-0.5 rounded border-green-500 text-green-600">{locale}</span>
              <a href="https://www.3asy.app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground text-green-600 font-medium">www.3asy.app</a>
            </div>
          </div>

            {/* Template Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t('footer.templateSection')}</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.links.home')}</Link></li>
              <li><Link to="/subscribe" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.links.pricing')}</Link></li>
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">{t('footer.links.features')}</a></li>
            </ul>
          </div>

          {/* Ecosystem */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t('footer.ecosystemSection')}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="https://3asywhistle.it"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="3ASYWHISTLE – Whistleblowing platform"
                >
                  {t('footer.ecosystem.whistle')}
                </a>
              </li>
              <li>
                <a
                  href="https://3asymodeling.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="3ASYMODELING – AI 3D Generation"
                >
                  {t('footer.ecosystem.modeling')}
                </a>
              </li>
              <li>
                <a
                  href="https://3festo.coming.soon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="3ASYHR – HR Solutions Platform"
                >
                  {t('footer.ecosystem.hr')}
                </a>
              </li>
              <li>
                <a
                  href="https://3asychannelmanager.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                  title="3ASYCHANNELMANAGER – Channel Sync"
                >
                  {t('footer.ecosystem.channel')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t('footer.supportSection')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://github.com/michelemonti/3ASYAPPS" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.links.githubRepo')}
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/michelemonti/3ASYAPPS/issues" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.links.issues')}
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/michelemonti/3ASYAPPS/discussions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {t('footer.links.discussions')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          <p>
            © {year} {t('footer.brand.title')} • {t('footer.brand.tagline')} • {t('footer.brand.description1')} • {t('footer.brand.description2')} — {t('footer.links.githubRepo')}
          </p>
          <p className="mt-2">
            {t('home.credit')} <strong className="text-foreground">Michele Miky Monti</strong> — {t('footer.brand.title')} ({locale.toUpperCase()})
          </p>
        </div>
      </div>
    </footer>
  )
}
