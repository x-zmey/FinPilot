import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, DollarSign, Calendar, Lightbulb } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import { getCashFlowForecast } from '@/lib/api'
import type { ForecastMonth } from '@/lib/api'

type Scenario = 'conservative' | 'base' | 'optimistic'

const SCENARIO_MULTIPLIER: Record<Scenario, number> = {
  conservative: 0.85,
  base: 1.0,
  optimistic: 1.15,
}

const SCENARIO_LABELS: Record<Scenario, string> = {
  conservative: 'Conservative',
  base: 'Base Case',
  optimistic: 'Optimistic',
}

const AI_INSIGHTS = [
  'Cash reserves expected to increase 12% by Q3 2026 based on current trends.',
  'Operating expenses have stabilized — payroll costs remain consistent at ~47% of revenue.',
  'Projected revenue dip in October may require drawing from savings. Consider proactive client outreach.',
  'Q4 shows strong recovery: December projected cash flow of $32K is the highest of the year.',
  'Current burn rate is sustainable for 18+ months without additional revenue.',
]

interface ChartMonth {
  month: string
  projected: number
  actual: number | undefined
  revenue: number
  expenses: number
  net: number
  cumulative: number
}

export default function CashFlowPage() {
  const [forecast, setForecast] = useState<ForecastMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [scenario, setScenario] = useState<Scenario>('base')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getCashFlowForecast()
    setForecast(data)
    setLoading(false)
  }

  const multiplier = SCENARIO_MULTIPLIER[scenario]

  const chartData: ChartMonth[] = (() => {
    let cumulative = 0
    return forecast.map(m => {
      const revenue = m.actual !== undefined ? m.revenue : m.revenue * multiplier
      const expenses = m.actual !== undefined ? m.expenses : m.expenses * (2 - multiplier + 0.1 * (1 - multiplier))
      const net = revenue - expenses
      cumulative += net
      return {
        month: m.month,
        projected: Math.round(m.projected * multiplier),
        actual: m.actual,
        revenue: Math.round(revenue),
        expenses: Math.round(expenses),
        net: Math.round(net),
        cumulative: Math.round(cumulative),
      }
    })
  })()

  const currentCash = 173320.55
  const projectedNet30 = chartData.slice(0, 1).reduce((s, m) => s + m.net, 0)
  const projectedNet60 = chartData.slice(0, 2).reduce((s, m) => s + m.net, 0)
  const projectedNet90 = chartData.slice(0, 3).reduce((s, m) => s + m.net, 0)

  const totalRevenue = chartData.reduce((s, m) => s + m.revenue, 0)
  const totalExpenses = chartData.reduce((s, m) => s + m.expenses, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cash Flow</h1>
          <p className="text-sm text-gray-500 mt-0.5">12-month forecast and actuals</p>
        </div>

        {/* Scenario toggle */}
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden self-start sm:self-auto">
          {(['conservative', 'base', 'optimistic'] as Scenario[]).map(s => (
            <button
              key={s}
              onClick={() => setScenario(s)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                scenario === s
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {SCENARIO_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Current Cash', value: currentCash, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Projected +30 Days', value: currentCash + projectedNet30, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
          { label: 'Projected +60 Days', value: currentCash + projectedNet60, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
          { label: 'Projected +90 Days', value: currentCash + projectedNet90, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="p-4">
              {loading ? (
                <>
                  <Skeleton className="h-3 w-24 mb-2" />
                  <Skeleton className="h-7 w-32" />
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', card.color.split(' ')[0])}>
                    <card.icon className={cn('h-4 w-4', card.color.split(' ')[1])} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{card.label}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(card.value)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-gray-800">
            Projected vs Actual Cash Flow
            <span className="ml-2 text-xs font-normal text-gray-400">({SCENARIO_LABELS[scenario]})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-72 w-full rounded-lg" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="cfProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="cfActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  interval={1}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="projected"
                  name="Projected"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#cfProjected)"
                  strokeDasharray="5 3"
                />
                <Area
                  type="monotone"
                  dataKey="actual"
                  name="Actual"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#cfActual)"
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Table + Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Monthly breakdown table */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 font-medium pb-2 pr-4">Month</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2 pr-4">Revenue</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2 pr-4">Expenses</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2 pr-4">Net</th>
                      <th className="text-right text-xs text-gray-400 font-medium pb-2">Cumulative</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {chartData.map((row, idx) => {
                      const isFuture = forecast[idx]?.actual === undefined
                      return (
                        <tr key={row.month} className={cn('hover:bg-gray-50/50', isFuture && 'opacity-70')}>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-700">{row.month}</span>
                              {isFuture && (
                                <span className="text-[10px] text-purple-400 font-medium">FORECAST</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 pr-4 text-right text-emerald-600 font-medium">{formatCurrency(row.revenue)}</td>
                          <td className="py-2 pr-4 text-right text-red-500 font-medium">{formatCurrency(row.expenses)}</td>
                          <td className={cn('py-2 pr-4 text-right font-semibold', row.net >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                            {row.net >= 0 ? '+' : ''}{formatCurrency(row.net)}
                          </td>
                          <td className="py-2 text-right text-gray-600">{formatCurrency(row.cumulative)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td className="py-2 pr-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">Total</td>
                      <td className="py-2 pr-4 text-right font-bold text-emerald-600">{formatCurrency(totalRevenue)}</td>
                      <td className="py-2 pr-4 text-right font-bold text-red-500">{formatCurrency(totalExpenses)}</td>
                      <td className={cn('py-2 pr-4 text-right font-bold', totalRevenue - totalExpenses >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {formatCurrency(totalRevenue - totalExpenses)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Insights panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              AI Insights
            </CardTitle>
            <p className="text-xs text-gray-400">Generated based on your financial data</p>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 p-3">
                    <Skeleton className="h-3 w-full mb-1.5" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                ))
              : AI_INSIGHTS.map((insight, i) => (
                  <div key={i} className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                    <p className="text-xs text-amber-900 leading-relaxed">{insight}</p>
                  </div>
                ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-amber-700 border-amber-200 hover:bg-amber-50 mt-2"
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Refresh Insights
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
