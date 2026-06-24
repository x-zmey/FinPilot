import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Tag,
  Trash2,
  Sparkles,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  getTransactions,
  getCategories,
  getAccounts,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  categorizeTransaction,
} from '@/lib/api'
import type { Transaction, Category, Account } from '@/lib/api'

type StatusFilter = 'all' | 'categorized' | 'uncategorized' | 'review'

function statusVariant(status: Transaction['status']): 'success' | 'warning' | 'secondary' {
  if (status === 'categorized') return 'success'
  if (status === 'review') return 'warning'
  return 'secondary'
}

const STATUS_LABEL: Record<Transaction['status'], string> = {
  categorized: 'Categorized',
  uncategorized: 'Uncategorized',
  review: 'Review',
}

interface AddTransactionForm {
  date: string
  description: string
  amount: string
  type: 'income' | 'expense'
  category: string
  categoryId: string
  merchant: string
  accountId: string
  account: string
}

const EMPTY_FORM: AddTransactionForm = {
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: '',
  type: 'expense',
  category: '',
  categoryId: '',
  merchant: '',
  accountId: '',
  account: '',
}

const PAGE_SIZE = 10

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<AddTransactionForm>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  // AI suggestion state: txnId -> shown
  const [aiShown, setAiShown] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [t, c, a] = await Promise.all([getTransactions(), getCategories(), getAccounts()])
    setTransactions(t)
    setCategories(c)
    setAccounts(a)
    setLoading(false)
  }

  const filtered = transactions.filter(t => {
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      t.description.toLowerCase().includes(q) ||
      t.merchant.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    const matchesCategory = categoryFilter === 'all' || t.categoryId === categoryFilter
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const visible = filtered.slice(0, visibleCount)

  const handleAddTransaction = async () => {
    if (!form.description || !form.amount || !form.date) {
      toast.error('Please fill in required fields')
      return
    }
    setSubmitting(true)
    try {
      const selectedAccount = accounts.find(a => a.id === form.accountId)
      const selectedCategory = categories.find(c => c.id === form.categoryId)
      const newTxn = await createTransaction({
        date: form.date,
        description: form.description,
        amount: parseFloat(form.amount),
        type: form.type,
        category: selectedCategory?.name ?? '',
        categoryId: form.categoryId,
        merchant: form.merchant,
        account: selectedAccount?.name ?? '',
        accountId: form.accountId,
        status: form.categoryId ? 'categorized' : 'uncategorized',
        reconciled: false,
      })
      setTransactions(prev => [newTxn, ...prev])
      setForm(EMPTY_FORM)
      setDialogOpen(false)
      toast.success('Transaction added successfully')
    } catch {
      toast.error('Failed to add transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id)
      setTransactions(prev => prev.filter(t => t.id !== id))
      toast.success('Transaction deleted')
    } catch {
      toast.error('Failed to delete transaction')
    }
  }

  const handleAcceptAiSuggestion = async (txn: Transaction) => {
    if (!txn.aiSuggestion) return
    const cat = categories.find(c => c.name === txn.aiSuggestion)
    try {
      const updated = await categorizeTransaction(txn.id, cat?.id ?? '', txn.aiSuggestion)
      setTransactions(prev => prev.map(t => t.id === txn.id ? updated : t))
      setAiShown(prev => ({ ...prev, [txn.id]: false }))
      toast.success(`Categorized as "${txn.aiSuggestion}"`)
    } catch {
      toast.error('Failed to categorize')
    }
  }

  const handleRejectAiSuggestion = async (txnId: string) => {
    try {
      const updated = await updateTransaction(txnId, { status: 'review' })
      setTransactions(prev => prev.map(t => t.id === txnId ? updated : t))
      setAiShown(prev => ({ ...prev, [txnId]: false }))
      toast('Suggestion rejected', { icon: '👋' })
    } catch {
      toast.error('Failed to update')
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">{transactions.length} total transactions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto">
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search description, merchant, category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="categorized">Categorized</SelectItem>
                <SelectItem value="uncategorized">Uncategorized</SelectItem>
                <SelectItem value="review">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/60">
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Description</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Merchant</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Category</th>
                  <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Status</th>
                  <th className="px-4 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-44" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                        <td className="px-4 py-3"><Skeleton className="h-7 w-7 rounded" /></td>
                      </tr>
                    ))
                  : visible.map(txn => (
                      <>
                        <tr key={txn.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(txn.date)}</td>
                          <td className="px-4 py-3 text-gray-800 font-medium max-w-[200px]">
                            <span className="truncate block">{txn.description}</span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{txn.merchant}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">{txn.category || <span className="text-gray-300 italic">Uncategorized</span>}</span>
                              {txn.aiSuggestion && txn.status === 'uncategorized' && !aiShown[txn.id] && (
                                <button
                                  onClick={() => setAiShown(prev => ({ ...prev, [txn.id]: true }))}
                                  className="inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-full transition-colors"
                                >
                                  <Sparkles className="h-3 w-3" />
                                  AI Suggest
                                </button>
                              )}
                            </div>
                          </td>
                          <td className={cn(
                            'px-4 py-3 text-right font-semibold whitespace-nowrap',
                            txn.type === 'income' ? 'text-emerald-600' : 'text-red-500',
                          )}>
                            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={statusVariant(txn.status)}>{STATUS_LABEL[txn.status]}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={async () => {
                                    await updateTransaction(txn.id, { status: 'categorized' })
                                    setTransactions(prev => prev.map(t => t.id === txn.id ? { ...t, status: 'categorized' } : t))
                                    toast.success('Transaction updated')
                                  }}
                                >
                                  <Pencil className="h-4 w-4 mr-2" />Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setAiShown(prev => ({ ...prev, [txn.id]: true }))}
                                  disabled={!txn.aiSuggestion}
                                >
                                  <Tag className="h-4 w-4 mr-2" />Categorize
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => handleDelete(txn.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                        {/* AI Suggestion row */}
                        {aiShown[txn.id] && txn.aiSuggestion && (
                          <tr key={`${txn.id}-ai`} className="bg-purple-50/50">
                            <td colSpan={7} className="px-4 py-2.5">
                              <div className="flex items-center gap-3 flex-wrap">
                                <Sparkles className="h-4 w-4 text-purple-500 flex-shrink-0" />
                                <span className="text-sm text-purple-800">
                                  AI suggests: <strong>{txn.aiSuggestion}</strong>
                                  <span className="ml-2 text-purple-500 text-xs">
                                    ({((txn.confidence ?? 0) * 100).toFixed(0)}% confidence)
                                  </span>
                                </span>
                                <div className="flex gap-2 ml-auto">
                                  <Button
                                    size="sm"
                                    className="h-7 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                                    onClick={() => handleAcceptAiSuggestion(txn)}
                                  >
                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Accept
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 text-xs border-purple-200 text-purple-600 hover:bg-purple-50"
                                    onClick={() => handleRejectAiSuggestion(txn.id)}
                                  >
                                    <XCircle className="h-3.5 w-3.5 mr-1" />Reject
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No transactions match your filters</p>
            </div>
          )}

          {/* Show more / less */}
          {!loading && filtered.length > PAGE_SIZE && (
            <div className="px-4 py-3 border-t border-gray-100 text-center">
              {visibleCount < filtered.length ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-600 hover:text-emerald-700"
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                >
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show more ({filtered.length - visibleCount} remaining)
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500"
                  onClick={() => setVisibleCount(PAGE_SIZE)}
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show less
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="txn-date">Date *</Label>
                <Input
                  id="txn-date"
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-type">Type</Label>
                <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as 'income' | 'expense' }))}>
                  <SelectTrigger id="txn-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-desc">Description *</Label>
              <Input
                id="txn-desc"
                placeholder="e.g. Monthly retainer payment"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="txn-amount">Amount *</Label>
                <Input
                  id="txn-amount"
                  type="number"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="txn-merchant">Merchant</Label>
                <Input
                  id="txn-merchant"
                  placeholder="e.g. Amazon"
                  value={form.merchant}
                  onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-category">Category</Label>
              <Select value={form.categoryId} onValueChange={v => setForm(f => ({ ...f, categoryId: v }))}>
                <SelectTrigger id="txn-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="txn-account">Account</Label>
              <Select value={form.accountId} onValueChange={v => setForm(f => ({ ...f, accountId: v }))}>
                <SelectTrigger id="txn-account">
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleAddTransaction}
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add Transaction'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
