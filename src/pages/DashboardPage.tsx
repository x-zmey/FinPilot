import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Upload,
  Plus,
  GitCompare,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import {
  getDashboardKPIs,
  getRevenueExpenseChart,
  getTransactions,
  getAccounts,
} from '@/lib/api'
import type { KPI, Transaction, Account } from '@/lib/api'

const KPI_ICONS = [DollarSign, TrendingDown, TrendingUp, AlertCircle]
const KPI_COLORS = [
  { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  { bg: 'bg-red-50', icon: 'text-red-500', border: 'border-red-100' },
  { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
  { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
]

function statusVariant(status: Transaction['status']): 'success' | 'warning' | 'secondary' {
  if (status === 'categorized') return 'success'
  if (status === 'review') return 'warning'
  return 'secondary'
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<KPI[]>([])
  const [chartData, setChartData] = useState<{ month: string; revenue: number; expenses: number }[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [k, c, t, a] = await Promise.all([
      getDashboardKPIs(),
      getRevenueExpenseChart(),
      getTransactions(),
      getAccounts(),
    ])
    setKpis(k)
    setChartData(c)
    setTransactions(t.slice(0, 5))
    setAccounts(a)
    setLoading(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview for June 2026</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <Skeleton className="h-4 w-28 mb-3" />
                  <Skeleton className="h-8 w-36 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))
          : kpis.map((kpi, i) => {
              const Icon = KPI_ICONS[i]
              const color = KPI_COLORS[i]
              const positive = kpi.change >= 0
              return (
                <Card key={kpi.label} className={cn('border', color.border)}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                        <p className="mt-1.5 text-2xl font-bold text-gray-900">
                          {kpi.prefix}
                          {typeof kpi.value === 'number' && kpi.prefix === '$'
                            ? kpi.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : kpi.value}
                          {kpi.suffix}
                        </p>
                      </div>
                      <div className={cn('rounded-lg p-2.5', color.bg)}>
                        <Icon className={cn('h-5 w-5', color.icon)} />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                      {positive ? (
                        <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className={cn('text-xs font-medium', positive ? 'text-emerald-600' : 'text-red-500')}>
                        {formatPercent(kpi.change)}
                      </span>
                      <span className="text-xs text-gray-400">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Charts + Accounts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue vs Expenses chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Revenue vs Expenses</CardTitle>
            <p className="text-xs text-gray-500">Last 12 months</p>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <Skeleton className="h-64 w-full rounded-lg" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={false}
                    interval={2}
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
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Accounts overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-gray-800">Connected Accounts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-3.5 w-32 mb-1.5" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              : accounts.map(account => (
                  <div key={account.id} className="flex items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'h-9 w-9 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold',
                        account.type === 'checking' ? 'bg-blue-100 text-blue-700' :
                        account.type === 'savings' ? 'bg-emerald-100 text-emerald-700' :
                        account.type === 'credit' ? 'bg-red-100 text-red-700' :
                        'bg-purple-100 text-purple-700',
                      )}>
                        {account.institution.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{account.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{account.type}</p>
                      </div>
                    </div>
                    <span className={cn(
                      'text-sm font-semibold flex-shrink-0',
                      account.balance < 0 ? 'text-red-500' : 'text-gray-900',
                    )}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-gray-800">Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 text-xs" onClick={() => navigate('/transactions')}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium text-gray-400 pb-2 pr-4">Date</th>
                      <th className="text-left text-xs font-medium text-gray-400 pb-2 pr-4">Description</th>
                      <th className="text-left text-xs font-medium text-gray-400 pb-2 pr-4">Category</th>
                      <th className="text-right text-xs font-medium text-gray-400 pb-2 pr-4">Amount</th>
                      <th className="text-left text-xs font-medium text-gray-400 pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.map(txn => (
                      <tr key={txn.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 pr-4 text-gray-500 whitespace-nowrap">{formatDate(txn.date)}</td>
                        <td className="py-2.5 pr-4 text-gray-800 font-medium max-w-[180px] truncate">{txn.description}</td>
                        <td className="py-2.5 pr-4 text-gray-500">{txn.category || '—'}</td>
                        <td className={cn(
                          'py-2.5 pr-4 text-right font-semibold whitespace-nowrap',
                          txn.type === 'income' ? 'text-emerald-600' : 'text-red-500',
                        )}>
                          {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                        </td>
                        <td className="py-2.5">
                          <Badge variant={statusVariant(txn.status)} className="capitalize">
                            {txn.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-gray-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2.5">
            {[
              { label: 'Upload Document', icon: Upload, to: '/documents', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Add Transaction', icon: Plus, to: '/transactions', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
              { label: 'Run Reconciliation', icon: GitCompare, to: '/reconciliation', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
              { label: 'Generate Report', icon: BarChart3, to: '/reports', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            ].map(({ label, icon: Icon, to, color }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors text-left',
                  color,
                )}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" />
                {label}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
