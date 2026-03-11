/**
 * Wealth Summary Page
 * 
 * Dashboard with wealth overview and category breakdown
 * Dark-mode compatible, locale-aware formatting
 * 
 * @author Michele Miky Monti
 * @version 2.0.0
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useWealthStore } from '@/stores/wealthStore'
import { useCurrency } from '@/hooks/useCurrency'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { PDFReportButton } from '@/components/PDFReportButton'
import { PDFPrivacyBadge } from '@/components/PDFPrivacyBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, Wallet, Building2, Home, Gem, Package, AlertCircle } from 'lucide-react'
import { CATEGORY_METADATA, type AssetCategory, type CategorySummary, type WealthSummary as SummaryData } from '@/types/wealth'

const categoryIcons = {
  Building2,
  Home,
  Gem,
  Wallet,
}

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  amber: '#F59E0B',
}

export default function WealthSummary() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { format: formatCurrency, formatCompact, symbol: currencySymbol } = useCurrency()
  
  const assets = useWealthStore((state) => state.assets)
  
  const getCategoryLabel = (category: AssetCategory) => t(`categories.${category}`)
  
  const summary = useMemo<SummaryData>(() => {
    if (assets.length === 0) {
      return {
        totalWealth: 0,
        categories: [],
        lastUpdated: new Date(),
        assetCount: 0,
      }
    }

    const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0)

    const categoryMap = new Map<AssetCategory, { total: number; count: number }>()
    assets.forEach((asset) => {
      const existing = categoryMap.get(asset.category) ?? { total: 0, count: 0 }
      categoryMap.set(asset.category, {
        total: existing.total + asset.value,
        count: existing.count + 1,
      })
    })

    const categories = Array.from(categoryMap.entries()).map<CategorySummary>(
      ([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: totalWealth > 0 ? (data.total / totalWealth) * 100 : 0,
      })
    )

    categories.sort((a, b) => b.total - a.total)

    return {
      totalWealth,
      categories,
      lastUpdated: new Date(),
      assetCount: assets.length,
    }
  }, [assets])

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const pieData = useMemo(() => summary.categories.map((cat) => ({
    name: getCategoryLabel(cat.category),
    value: cat.total,
    percentage: cat.percentage,
    color: COLORS[CATEGORY_METADATA[cat.category].color as keyof typeof COLORS],
  })), [summary.categories])

  const barData = useMemo(() => summary.categories.map((cat) => ({
    name: getCategoryLabel(cat.category),
    value: cat.total,
    color: COLORS[CATEGORY_METADATA[cat.category].color as keyof typeof COLORS],
  })), [summary.categories])

  // Detect dark mode for chart styling
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const chartTextColor = isDark ? '#a1a1aa' : '#71717a'
  const chartBg = isDark ? 'hsl(0 0% 10%)' : 'white'
  const chartBorder = isDark ? 'hsl(215 28% 20%)' : '#e5e7eb'

  if (assets.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {t('summary.title')}
                </h1>
                <p className="text-muted-foreground">
                  {t('summary.by_category')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <PDFPrivacyBadge />
                <PDFReportButton />
              </div>
            </div>
          </div>

          <Card className="border-2 border-dashed border-border">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">
                {t('summary.empty.title')}
              </h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                {t('summary.empty.message')}
              </p>
              <p className="text-muted-foreground/70 text-sm text-center mb-6 max-w-lg">
                {t('summary.empty.cta')}
              </p>
              <Button 
                onClick={() => navigate('/assets')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('app.nav.assets')}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {t('summary.title')}
              </h1>
              <p className="text-muted-foreground">
                {t('summary.by_category')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <PDFPrivacyBadge />
              <PDFReportButton />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Total Wealth */}
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                {t('summary.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {formatCurrency(summary.totalWealth)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.lastUpdated.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Asset Count */}
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                {t('summary.asset_count')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {summary.assetCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('summary.asset_count')}
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                {t('assetsTable.table.category')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {summary.categories.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t('summary.category_distribution')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        {summary.categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('summary.category_distribution')}</CardTitle>
                <CardDescription>{t('summary.by_category')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ percentage }) => `${percentage.toFixed(1)}%`}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      strokeWidth={2}
                      stroke={chartBg}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: chartBg,
                        border: `1px solid ${chartBorder}`,
                        borderRadius: '8px',
                        color: isDark ? '#f4f4f5' : '#18181b',
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: chartTextColor }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t('summary.category_comparison')}</CardTitle>
                <CardDescription>{t('summary.by_category')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartBorder} />
                    <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 12 }} />
                    <YAxis 
                      tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}K`} 
                      tick={{ fill: chartTextColor, fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: chartBg,
                        border: `1px solid ${chartBorder}`,
                        borderRadius: '8px',
                        color: isDark ? '#f4f4f5' : '#18181b',
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Breakdown */}
        {summary.categories.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">{t('summary.by_category')}</CardTitle>
              <CardDescription>
                {t('summary.category_distribution')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.categories.map((category) => {
                  const metadata = CATEGORY_METADATA[category.category]
                  const IconComponent = categoryIcons[metadata.icon as keyof typeof categoryIcons]
                  const color = COLORS[metadata.color as keyof typeof COLORS]

                  return (
                    <div key={category.category} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {getCategoryLabel(category.category)}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {category.count} {t('summary.asset_count')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground tabular-nums">
                            {formatCurrency(category.total)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {formatPercentage(category.percentage)}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
