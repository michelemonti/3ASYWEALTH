import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslation } from 'react-i18next'
import { useFormat } from '@/hooks/useFormat'

export interface HistoryPoint {
  id: string
  date: string
  netWorth: number
  assets: number
  liabilities: number
}

const SERIES = [
  { key: 'netWorth', color: 'hsl(var(--primary))', width: 2.5 },
  { key: 'assets', color: 'hsl(var(--muted-foreground))', width: 1.5 },
  { key: 'liabilities', color: 'hsl(var(--debt))', width: 1.5 },
] as const

export default function HistoryChart({ points }: { points: HistoryPoint[] }) {
  const { t } = useTranslation()
  const f = useFormat()
  const days = new Set(points.map((p) => f.date(p.date)))
  // Several snapshots on the same day need the time to be told apart.
  const tick = (d: string) => (days.size < points.length ? f.dateTime(d) : f.date(d))
  return (
    <div className="h-72 w-full" role="img" aria-label={t('history.chartAria', { count: points.length })}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={tick}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
          />
          <YAxis
            width={f.hidden ? 8 : 72}
            tick={f.hidden ? false : { fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            tickFormatter={(v: number) => f.money(v, { compact: true })}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [f.money(value), t(`summary.${name}`)]}
            labelFormatter={(d: string) => f.dateTime(d)}
            contentStyle={{
              background: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 10,
              color: 'hsl(var(--popover-foreground))',
            }}
          />
          {SERIES.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={s.width}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
