import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  GitCompare,
  CheckCircle,
  Clock,
  Circle,
  Link,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { cn, formatDate } from '@/lib/utils'
import { getReconciliations, updateReconciliation } from '@/lib/api'
import type { Reconciliation } from '@/lib/api'

type RecStatus = Reconciliation['status']

function statusVariant(status: RecStatus): 'success' | 'warning' | 'secondary' {
  if (status === 'completed') return 'success'
  if (status === 'in_progress') return 'warning'
  return 'secondary'
}

function statusLabel(status: RecStatus) {
  if (status === 'completed') return 'Completed'
  if (status === 'in_progress') return 'In Progress'
  return 'Pending'
}

function statusIcon(status: RecStatus) {
  if (status === 'completed') return <CheckCircle className="h-4 w-4 text-emerald-500" />
  if (status === 'in_progress') return <Clock className="h-4 w-4 text-amber-500" />
  return <Circle className="h-4 w-4 text-gray-400" />
}

// Mock side-by-side data for detail view
const BANK_ITEMS = [
  { id: 'b1', date: '2026-06-20', description: 'Apex Technologies - ACH', amount: 12500.00, matched: true },
  { id: 'b2', date: '2026-06-18', description: 'RENT WESTSIDE REALTY', amount: -3800.00, matched: true },
  { id: 'b3', date: '2026-06-15', description: 'GUSTO PAYROLL', amount: -18450.00, matched: true },
  { id: 'b4', date: '2026-06-10', description: 'Harbor Financial - WIRE', amount: 8750.00, matched: true },
  { id: 'b5', date: '2026-06-05', description: 'CON EDISON ELECTRIC', amount: -318.45, matched: true },
  { id: 'b6', date: '2026-06-22', description: 'UNKNOWN DEBIT REF 9921', amount: -200.00, matched: false },
  { id: 'b7', date: '2026-06-21', description: 'TRANSFER IN FROM SAV', amount: 5000.00, matched: false },
  { id: 'b8', date: '2026-06-19', description: 'VENDOR PMT 4482', amount: -450.00, matched: false },
]

const BOOK_ITEMS = [
  { id: 'bk1', date: '2026-06-20', description: 'Monthly retainer - Apex Technologies', amount: 12500.00, matched: true },
  { id: 'bk2', date: '2026-06-18', description: 'Office lease - June 2026', amount: -3800.00, matched: true },
  { id: 'bk3', date: '2026-06-15', description: 'Bi-weekly payroll run', amount: -18450.00, matched: true },
  { id: 'bk4', date: '2026-06-10', description: 'Project invoice - Harbor Financial Group', amount: 8750.00, matched: true },
  { id: 'bk5', date: '2026-06-05', description: 'Electricity bill - June', amount: -318.45, matched: true },
  { id: 'bk6', date: '2026-06-09', description: 'Attorney fees - contract review', amount: -1500.00, matched: false },
]

export default function ReconciliationPage() {
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRec, setSelectedRec] = useState<Reconciliation | null>(null)
  const [matchedItems, setMatchedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getReconciliations()
    setReconciliations(data)
    setLoading(false)
  }

  const totalCompleted = reconciliations.filter(r => r.status === 'completed').length
  const totalInProgress = reconciliations.filter(r => r.status === 'in_progress').length
  const totalPending = reconciliations.filter(r => r.status === 'pending').length
  const overallProgress =
    reconciliations.length > 0
      ? Math.round(
          reconciliations.reduce((sum, r) => sum + (r.matchedCount / (r.totalItems || 1)), 0) /
          reconciliations.length * 100,
        )
      : 0

  const handleMatchItem = (itemId: string) => {
    setMatchedItems(prev => {
      const next = new Set(prev)
      next.add(itemId)
      return next
    })
    toast.success('Item matched successfully')
  }

  const handleCompleteReconciliation = async (rec: Reconciliation) => {
    try {
      const updated = await updateReconciliation(rec.id, {
        status: 'completed',
        matchedCount: rec.totalItems,
        unmatchedCount: 0,
        completedDate: new Date().toISOString().slice(0, 10),
      })
      setReconciliations(prev => prev.map(r => r.id === rec.id ? updated : r))
      setSelectedRec(null)
      toast.success(`Reconciliation for ${rec.accountName} marked complete`)
    } catch {
      toast.error('Failed to update reconciliation')
    }
  }

  if (selectedRec) {
    const bankUnmatched = BANK_ITEMS.filter(i => !i.matched && !matchedItems.has(i.id))
    const bookUnmatched = BOOK_ITEMS.filter(i => !i.matched)

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setSelectedRec(null); setMatchedItems(new Set()) }}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />Back
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{selectedRec.accountName}</h1>
            <p className="text-sm text-gray-500">{selectedRec.period} reconciliation</p>
          </div>
          <Badge variant={statusVariant(selectedRec.status)} className="ml-2">
            {statusLabel(selectedRec.status)}
          </Badge>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {selectedRec.matchedCount + matchedItems.size} / {selectedRec.totalItems} matched
              </span>
            </div>
            <Progress
              value={((selectedRec.matchedCount + matchedItems.size) / selectedRec.totalItems) * 100}
              className="h-2"
            />
            {bankUnmatched.length === 0 && bookUnmatched.length === 0 && (
              <Button
                className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
                onClick={() => handleCompleteReconciliation(selectedRec)}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />Mark Complete
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Side-by-side view */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bank statement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-800">Bank Statement</CardTitle>
              <p className="text-xs text-gray-500">{BANK_ITEMS.length} items</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {BANK_ITEMS.map(item => {
                const isMatched = item.matched || matchedItems.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm border',
                      isMatched ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 truncate">{item.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={cn('font-semibold', item.amount >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
                      </span>
                      {isMatched ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-amber-300 text-amber-700 hover:bg-amber-100"
                          onClick={() => handleMatchItem(item.id)}
                        >
                          <Link className="h-3 w-3 mr-1" />Match
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Book transactions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-800">Book Transactions</CardTitle>
              <p className="text-xs text-gray-500">{BOOK_ITEMS.length} items</p>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              {BOOK_ITEMS.map(item => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm border',
                    item.matched ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50 border-gray-100',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 truncate">{item.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={cn('font-semibold', item.amount >= 0 ? 'text-emerald-600' : 'text-red-500')}>
                      {item.amount >= 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
                    </span>
                    {item.matched ? (
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Circle className="h-4 w-4 text-gray-300" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reconciliation</h1>
        <p className="text-sm text-gray-500 mt-0.5">Match bank transactions to your books</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Overall Progress', value: `${overallProgress}%`, icon: GitCompare, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Completed', value: String(totalCompleted), icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'In Progress', value: String(totalInProgress), icon: Clock, color: 'text-amber-600 bg-amber-50' },
          { label: 'Pending', value: String(totalPending), icon: Circle, color: 'text-gray-500 bg-gray-100' },
        ].map(card => (
          <Card key={card.label}>
            <CardContent className="p-4">
              {loading ? (
                <>
                  <Skeleton className="h-3 w-20 mb-2" />
                  <Skeleton className="h-7 w-12" />
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <div className={cn('rounded-lg p-2', card.color.split(' ')[1])}>
                    <card.icon className={cn('h-4 w-4', card.color.split(' ')[0])} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{card.label}</p>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reconciliations table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Account</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Period</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Matched</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3 min-w-[140px]">Progress</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Completed</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full max-w-[120px]" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : reconciliations.map(rec => {
                      const pct = rec.totalItems > 0 ? (rec.matchedCount / rec.totalItems) * 100 : 0
                      return (
                        <tr key={rec.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 font-medium text-gray-800">{rec.accountName}</td>
                          <td className="px-4 py-3 text-gray-500">{rec.period}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              {statusIcon(rec.status)}
                              <Badge variant={statusVariant(rec.status)}>{statusLabel(rec.status)}</Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <span className="text-emerald-600 font-semibold">{rec.matchedCount}</span>
                            <span className="text-gray-400">/{rec.totalItems}</span>
                            {rec.unmatchedCount > 0 && (
                              <span className="ml-2 text-amber-500 text-xs">({rec.unmatchedCount} unmatched)</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Progress value={pct} className="h-1.5 flex-1" />
                              <span className="text-xs text-gray-400 w-9 text-right">{pct.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {rec.completedDate ? formatDate(rec.completedDate) : '—'}
                          </td>
                          <td className="px-4 py-3">
                            {rec.status !== 'pending' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                onClick={() => setSelectedRec(rec)}
                              >
                                View <ChevronRight className="h-3 w-3 ml-0.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
