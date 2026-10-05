import { Briefcase, Gem, Home, Landmark, LineChart, Wallet, type LucideIcon } from 'lucide-react'
import type { AssetCategory } from '@/domain/types'

interface CategoryMeta {
  icon: LucideIcon
  /** Tailwind classes must be literal for the JIT compiler. */
  dot: string
  text: string
  soft: string
  /** CSS colour for inline styles (bars, charts). */
  color: string
}

export const CATEGORY_META: Record<AssetCategory, CategoryMeta> = {
  cash: { icon: Wallet, dot: 'bg-cat-cash', text: 'text-cat-cash', soft: 'bg-cat-cash/10', color: 'hsl(var(--cat-cash))' },
  investments: {
    icon: LineChart,
    dot: 'bg-cat-investments',
    text: 'text-cat-investments',
    soft: 'bg-cat-investments/10',
    color: 'hsl(var(--cat-investments))',
  },
  business: {
    icon: Briefcase,
    dot: 'bg-cat-business',
    text: 'text-cat-business',
    soft: 'bg-cat-business/10',
    color: 'hsl(var(--cat-business))',
  },
  realestate: {
    icon: Home,
    dot: 'bg-cat-realestate',
    text: 'text-cat-realestate',
    soft: 'bg-cat-realestate/10',
    color: 'hsl(var(--cat-realestate))',
  },
  personal: {
    icon: Gem,
    dot: 'bg-cat-personal',
    text: 'text-cat-personal',
    soft: 'bg-cat-personal/10',
    color: 'hsl(var(--cat-personal))',
  },
}

export const DEBT_META = { icon: Landmark, dot: 'bg-debt', text: 'text-debt', soft: 'bg-debt/10', color: 'hsl(var(--debt))' }
