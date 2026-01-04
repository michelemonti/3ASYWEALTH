/**
 * Theme Toggle Component
 * 
 * Beautiful animated toggle for dark/light mode
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { useTranslation } from 'react-i18next'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { t } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative h-9 w-9 rounded-full transition-all hover:bg-accent"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">{t('theme.toggle', 'Toggle theme')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>{t('theme.light', 'Light')}</span>
          {theme === 'light' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>{t('theme.dark', 'Dark')}</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>{t('theme.system', 'System')}</span>
          {theme === 'system' && <span className="ml-auto text-xs text-primary">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
