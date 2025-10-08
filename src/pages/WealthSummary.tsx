/**
 * Wealth Summary Page
 * 
 * Dashboard with wealth overview and category breakdown
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useWealthStore } from '@/stores/wealthStore'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { PDFReportButton } from '@/components/PDFReportButton'
import { PDFPrivacyBadge } from '@/components/PDFPrivacyBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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

export function WealthSummary() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  // Get assets from store
  const assets = useWealthStore((state) => state.assets)
  
  // Helper to get translated category label
  const getCategoryLabel = (category: AssetCategory) => t(`categories.${category}`)
  
  // Calculate summary with useMemo to prevent infinite loops
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

    // Sort by total value descending
    categories.sort((a, b) => b.total - a.total)

    return {
      totalWealth,
      categories,
      lastUpdated: new Date(),
      assetCount: assets.length,
    }
  }, [assets])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Data for pie chart
  const pieData = summary.categories.map((cat) => ({
    name: getCategoryLabel(cat.category),
    value: cat.total,
    percentage: cat.percentage,
    color: COLORS[CATEGORY_METADATA[cat.category].color as keyof typeof COLORS],
  }))

  // Data for bar chart
  const barData = summary.categories.map((cat) => ({
    name: getCategoryLabel(cat.category),
    value: cat.total,
    color: COLORS[CATEGORY_METADATA[cat.category].color as keyof typeof COLORS],
  }))

  // Empty state
  if (assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {t('summary.title')}
                </h1>
                <p className="text-gray-600">
                  {t('summary.by_category')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <PDFPrivacyBadge />
                <PDFReportButton />
              </div>
            </div>
          </div>

          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
              <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {t('summary.empty.title')}
              </h3>
              <p className="text-gray-600 text-center mb-6 max-w-md">
                {t('summary.empty.message')}
              </p>
              <p className="text-gray-500 text-sm text-center mb-6 max-w-lg">
                {t('summary.empty.cta')}
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                {t('app.nav.dashboard')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('summary.title')}
              </h1>
              <p className="text-gray-600">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Wealth */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {t('summary.total')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(summary.totalWealth)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {summary.lastUpdated.toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Asset Count */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Package className="w-4 h-4" />
                {t('summary.asset_count')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {summary.assetCount}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('summary.asset_count')}
              </p>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {t('assetsTable.table.category')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {summary.categories.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('summary.category_distribution')}
              </p>
            </CardContent>
          </Card>

          {/* Largest Category */}
          {summary.categories.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {t('summary.by_category')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-base px-3 py-1">
                  {getCategoryLabel(summary.categories[0].category)}
                </Badge>
                <p className="text-sm text-gray-500 mt-2">
                  {formatPercentage(summary.categories[0].percentage)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Charts Section */}
        {summary.categories.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('summary.category_distribution')}</CardTitle>
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
                      label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>{t('summary.category_comparison')}</CardTitle>
                <CardDescription>{t('summary.by_category')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Category Breakdown */}
        {summary.categories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('summary.by_category')}</CardTitle>
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
                    <div key={category.category} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${color}20` }}
                          >
                            <IconComponent className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {getCategoryLabel(category.category)}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {category.count} {t('summary.asset_count')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatCurrency(category.total)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatPercentage(category.percentage)}
                          </p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="h-2 rounded-full"
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
        
        <Footer />
      </div>
    </div>
  )
}
