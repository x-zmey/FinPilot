import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, FileSpreadsheet, BarChart3, RefreshCw, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  BarChart,
  Bar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { getReportConfigs } from '@/lib/api'
import type { ReportConfig } from '@/lib/api'

// P&L monthly data
const PNL_MONTHLY = [
  { month: 'Jan', revenue: 31200, cogs: 4680, operating: 5180 },
  { month: 'Feb', revenue: 29500, cogs: 4425, operating: 5205 },
  { month: 'Mar', revenue: 35800, cogs: 5370, operating: 6320 },
  { month: 'Apr', revenue: 32100, cogs: 4815, operating: 6835 },
  { month: 'May', revenue: 38900, cogs: 5835, operating: 6285 },
  { month: 'Jun', revenue: 36500, cogs: 5475, operating: 8675 },
]

const PNL_SUMMARY = {
  revenue: 204000,
  cogs: 30600,
  grossProfit: 173400,
  operatingExpenses: 38500,
  netIncome: 134900,
}

const BALANCE_SHEET = {
  assets: [
    { label: 'Cash & Equivalents', amount: 173320.55 },
    { label: 'Accounts Receivable', amount: 24500.00 },
    { label: 'Prepaid Expenses', amount: 3200.00 },
    { label: 'Office Equipment (net)', amount: 12400.00 },
    { label: 'Intangible Assets', amount: 5000.00 },
  ],
  liabilities: [
    { label: 'Accounts Payable', amount: 8420.30 },
    { label: 'Accrued Expenses', amount: 4100.00 },
    { label: 'Credit Card Balances', amount: 8987.90 },
    { label: 'Deferred Revenue', amount: 5000.00 },
  ],
  equity: [
    { label: "Owner's Equity", amount: 155000.00 },
    { label: 'Retained Earnings (YTD)', amount: 36912.35 },
  ],
}

const CASH_FLOW_ACTIVITIES = {
  operating: [
    { label: 'Net Income', amount: 134900 },
    { label: 'Depreciation & Amortization', amount: 2400 },
    { label: 'Increase in Accounts Receivable', amount: -4500 },
    { label: 'Increase in Accounts Payable', amount: 1200 },
    { label: 'Increase in Accrued Expenses', amount: 800 },
  ],
  investing: [
    { label: 'Purchase of Equipment', amount: -2340 },
    { label: 'Software Development Costs', amount: -1200 },
  ],
  financing: [
    { label: "Owner's Draw", amount: -12000 },
    { label: 'Loan Repayments', amount: 0 },
  ],
}

function Section({ title, items }: { title: string; items: { label: string; amount: number }[] }) {
  const total = items.reduce((s, i) => s + i.amount, 0)
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</h4>
      <div className="space-y-1">
        {items.map(item => (
          <div key={item.label} className="flex justify-between text-sm py-1 border-b border-gray-50">
            <span className="text-gray-600">{item.label}</span>
            <span className={cn('font-medium', item.amount < 0 ? 'text-red-500' : 'text-gray-800')}>
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
        <div className="flex justify-between text-sm py-2 font-semibold text-gray-900 border-t border-gray-200 mt-1">
          <span>Total {title}</span>
          <span className={total < 0 ? 'text-red-500' : 'text-emerald-600'}>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const [reportConfigs, setReportConfigs] = useState<ReportConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('ytd')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getReportConfigs()
    setReportConfigs(data)
    setLoading(false)
  }

  const handleExport = (type: 'pdf' | 'csv') => {
    toast.success(`Report exported as ${type.toUpperCase()} successfully`)
  }

  const handleGenerate = (name: string) => {
    toast.success(`Generating "${name}"...`)
  }

  const assetsTotal = BALANCE_SHEET.assets.reduce((s, i) => s + i.amount, 0)
  const liabilitiesTotal = BALANCE_SHEET.liabilities.reduce((s, i) => s + i.amount, 0)
  const equityTotal = BALANCE_SHEET.equity.reduce((s, i) => s + i.amount, 0)

  const operatingTotal = CASH_FLOW_ACTIVITIES.operating.reduce((s, i) => s + i.amount, 0)
  const investingTotal = CASH_FLOW_ACTIVITIES.investing.reduce((s, i) => s + i.amount, 0)
  const financingTotal = CASH_FLOW_ACTIVITIES.financing.reduce((s, i) => s + i.amount, 0)
  const netCashFlow = operatingTotal + investingTotal + financingTotal

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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-0.5">Financial statements and analytics</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="q2-2026">Q2 2026</SelectItem>
              <SelectItem value="q1-2026">Q1 2026</SelectItem>
              <SelectItem value="2025">FY 2025</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-1.5" />Export PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-1.5" />Export CSV
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pnl">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* P&L Tab */}
        <TabsContent value="pnl" className="mt-5 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: 'Revenue', value: PNL_SUMMARY.revenue, color: 'text-emerald-600' },
              { label: 'COGS', value: PNL_SUMMARY.cogs, color: 'text-red-500' },
              { label: 'Gross Profit', value: PNL_SUMMARY.grossProfit, color: 'text-blue-600' },
              { label: 'Operating Exp.', value: PNL_SUMMARY.operatingExpenses, color: 'text-orange-500' },
              { label: 'Net Income', value: PNL_SUMMARY.netIncome, color: 'text-emerald-600' },
            ].map(card => (
              <Card key={card.label}>
                <CardContent className="p-4">
                  {loading ? (
                    <>
                      <Skeleton className="h-3 w-20 mb-2" />
                      <Skeleton className="h-6 w-28" />
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-400 mb-1">{card.label}</p>
                      <p className={cn('text-lg font-bold', card.color)}>{formatCurrency(card.value)}</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-gray-800">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={PNL_MONTHLY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="cogs" name="COGS" fill="#f87171" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="operating" name="Operating Exp." fill="#fb923c" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Balance Sheet Tab */}
        <TabsContent value="balance" className="mt-5">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-20 mb-4" />
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex justify-between mb-2">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-emerald-700">Assets</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Section title="Assets" items={BALANCE_SHEET.assets} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-red-600">Liabilities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Section title="Liabilities" items={BALANCE_SHEET.liabilities} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-blue-600">Equity</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Section title="Equity" items={BALANCE_SHEET.equity} />
                  </CardContent>
                </Card>
              </div>
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <span className="text-gray-500">Total Assets: </span>
                      <span className="font-bold text-gray-900">{formatCurrency(assetsTotal)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Liabilities: </span>
                      <span className="font-bold text-red-500">{formatCurrency(liabilitiesTotal)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Total Equity: </span>
                      <span className="font-bold text-blue-600">{formatCurrency(equityTotal)}</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-gray-500">Liabilities + Equity: </span>
                      <span className={cn('font-bold', Math.abs(assetsTotal - (liabilitiesTotal + equityTotal)) < 1 ? 'text-emerald-600' : 'text-red-500')}>
                        {formatCurrency(liabilitiesTotal + equityTotal)}
                      </span>
                      {Math.abs(assetsTotal - (liabilitiesTotal + equityTotal)) < 1 && (
                        <span className="ml-2 text-xs text-emerald-500">Balanced</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Cash Flow Tab */}
        <TabsContent value="cashflow" className="mt-5 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="h-4 w-36 mb-4" />
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex justify-between mb-2">
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-blue-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-blue-700">Operating Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Section title="Operating" items={CASH_FLOW_ACTIVITIES.operating} />
                  </CardContent>
                </Card>
                <Card className="border-purple-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-purple-700">Investing Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Section title="Investing" items={CASH_FLOW_ACTIVITIES.investing} />
                  </CardContent>
                </Card>
                <Card className="border-orange-100">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-orange-700">Financing Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Section title="Financing" items={CASH_FLOW_ACTIVITIES.financing} />
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Net Change in Cash (YTD)</span>
                    <span className={cn('text-lg font-bold', netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {formatCurrency(netCashFlow)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Operating: <span className={operatingTotal >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{formatCurrency(operatingTotal)}</span></span>
                    <span>Investing: <span className={investingTotal >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{formatCurrency(investingTotal)}</span></span>
                    <span>Financing: <span className={financingTotal >= 0 ? 'text-emerald-600 font-medium' : 'text-red-500 font-medium'}>{formatCurrency(financingTotal)}</span></span>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Custom Reports Tab */}
        <TabsContent value="custom" className="mt-5">
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <Skeleton className="h-9 w-9 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-1.5" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20 rounded" />
                    </CardContent>
                  </Card>
                ))
              : reportConfigs.map(config => (
                  <Card key={config.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                        <BarChart3 className="h-4.5 w-4.5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">{config.name}</p>
                        <p className="text-xs text-gray-400">
                          {config.period} · Last generated {formatDate(config.lastGenerated)}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => handleGenerate(config.name)}
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />Generate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-gray-500"
                          onClick={() => handleExport('pdf')}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
