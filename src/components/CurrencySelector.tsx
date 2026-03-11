/**
 * Currency Selector Component
 * 
 * Toggle between EUR/USD with configurable exchange rate
 */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useWealthStore } from '@/stores/wealthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Currency } from '@/types/wealth'

const currencies: { code: Currency; symbol: string; label: string }[] = [
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
]

export function CurrencySelector() {
  const { t } = useTranslation()
  const displayCurrency = useWealthStore((s) => s.displayCurrency)
  const exchangeRate = useWealthStore((s) => s.exchangeRate)
  const setDisplayCurrency = useWealthStore((s) => s.setDisplayCurrency)
  const setExchangeRate = useWealthStore((s) => s.setExchangeRate)
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [rateInput, setRateInput] = useState(exchangeRate.toString())

  const current = currencies.find((c) => c.code === displayCurrency) || currencies[0]

  const handleCurrencyChange = (code: Currency) => {
    setDisplayCurrency(code)
  }

  const handleSaveRate = () => {
    const parsed = parseFloat(rateInput)
    if (parsed > 0 && isFinite(parsed)) {
      setExchangeRate(parsed)
      setRateDialogOpen(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5 px-2 sm:px-3">
            <span className="text-base leading-none">{current.symbol}</span>
            <span className="hidden sm:inline text-xs text-muted-foreground">{current.code}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currencies.map((c) => (
            <DropdownMenuItem
              key={c.code}
              onClick={() => handleCurrencyChange(c.code)}
              className="cursor-pointer"
            >
              <span className="mr-2 text-base">{c.symbol}</span>
              {c.label}
              {c.code === displayCurrency && (
                <span className="ml-auto text-xs text-blue-500">✓</span>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setRateInput(exchangeRate.toString())
              setRateDialogOpen(true)
            }}
            className="cursor-pointer text-muted-foreground"
          >
            {t('currency.editRate', 'Exchange rate')} (1 EUR = {exchangeRate} USD)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={rateDialogOpen} onOpenChange={setRateDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>{t('currency.rateTitle', 'Exchange Rate')}</DialogTitle>
            <DialogDescription>
              {t('currency.rateDescription', 'Set the EUR → USD conversion rate. Used to normalize mixed-currency assets.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            <Label htmlFor="exchange-rate">1 EUR =</Label>
            <div className="flex items-center gap-2">
              <Input
                id="exchange-rate"
                type="number"
                step="0.01"
                min="0.01"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-32"
              />
              <span className="text-muted-foreground">USD</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRateDialogOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSaveRate}>
              {t('common.save', 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
