/**
 * 📈 Wealth Summary Page
 * 
 * Dashboard with wealth overview and category breakdown
 * 
 * @author Michele Miky Monti
 * @version 1.0.0
 */

import { useMemo } from 'react'
import { useWealthStore } from '@/stores/wealthStore'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { TrendingUp, Wallet, Building2, Home, Gem, Package } from 'lucide-react'
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
  // Get assets from store
  const assets = useWealthStore((state) => state.assets)
  
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
    name: CATEGORY_METADATA[cat.category].label,
    value: cat.total,
    percentage: cat.percentage,
    color: COLORS[CATEGORY_METADATA[cat.category].color as keyof typeof COLORS],
  }))

  // Data for bar chart
  const barData = summary.categories.map((cat) => ({
    name: CATEGORY_METADATA[cat.category].label,
    value: cat.total,
    color: COLORS[CATEGORY_METADATA[cat.category].color as keyof typeof COLORS],
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sintesi Patrimonio
        </h1>
        <p className="text-gray-600">
          Panoramica completa del tuo wealth personale
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Wealth */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Patrimonio Totale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(summary.totalWealth)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Aggiornato: {summary.lastUpdated.toLocaleDateString('it-IT')}
            </p>
          </CardContent>
        </Card>

        {/* Asset Count */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Numero Asset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {summary.assetCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Asset totali registrati
            </p>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Categorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {summary.categories.length}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Categorie con asset
            </p>
          </CardContent>
        </Card>

        {/* Largest Category */}
        {summary.categories.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Categoria Principale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-base px-3 py-1">
                {CATEGORY_METADATA[summary.categories[0].category].label}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">
                {formatPercentage(summary.categories[0].percentage)} del totale
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Section */}
      {summary.categories.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Ripartizione per Categoria</CardTitle>
              <CardDescription>Distribuzione percentuale del patrimonio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${formatPercentage(percentage)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Valore per Categoria</CardTitle>
              <CardDescription>Confronto valori assoluti</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="mb-8">
          <CardContent className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nessun dato disponibile
            </h3>
            <p className="text-gray-600">
              Aggiungi i tuoi asset per visualizzare la sintesi del patrimonio
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Details */}
      {summary.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dettaglio Categorie</CardTitle>
            <CardDescription>Analisi dettagliata per categoria</CardDescription>
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
                            {metadata.label}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {category.count} asset
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
    </div>
  )
}
