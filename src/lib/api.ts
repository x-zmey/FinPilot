// Mock API for LedgerAI bookkeeping platform
// All data is persisted in localStorage with the `ledgerai_` prefix

export type User = {
  id: string
  email: string
  password: string
  name: string
  company: string
  role: string
  avatar?: string
}

export type Transaction = {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  categoryId: string
  account: string
  accountId: string
  status: 'categorized' | 'uncategorized' | 'review'
  merchant: string
  reconciled: boolean
  aiSuggestion?: string
  confidence?: number
}

export type Account = {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'payment'
  institution: string
  balance: number
  lastSync: string
  connected: boolean
}

export type Document = {
  id: string
  name: string
  type: 'invoice' | 'receipt' | 'statement' | 'contract' | 'tax'
  uploadDate: string
  size: string
  status: 'processed' | 'processing' | 'pending'
  extractedData?: Record<string, string>
  clientName?: string
}

export type Reconciliation = {
  id: string
  accountId: string
  accountName: string
  period: string
  status: 'completed' | 'in_progress' | 'pending'
  matchedCount: number
  unmatchedCount: number
  totalItems: number
  completedDate?: string
}

export type Category = {
  id: string
  name: string
  type: 'income' | 'expense'
  parentId?: string
  code: string
}

export type ForecastMonth = {
  month: string
  projected: number
  actual?: number
  revenue: number
  expenses: number
}

export type KPI = {
  label: string
  value: number
  change: number
  prefix?: string
  suffix?: string
}

export type ReportConfig = {
  id: string
  name: string
  type: string
  lastGenerated: string
  period: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const delay = () => new Promise<void>(r => setTimeout(r, Math.random() * 400 + 200))

function storageGet<T>(key: string): T | null {
  const raw = localStorage.getItem(`ledgerai_${key}`)
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function storageSet<T>(key: string, value: T): void {
  localStorage.setItem(`ledgerai_${key}`, JSON.stringify(value))
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const SEED_USERS: User[] = [
  {
    id: 'user-001',
    email: 'demo@ledgerai.com',
    password: 'demo1234',
    name: 'Alex Johnson',
    company: 'Meridian Consulting LLC',
    role: 'admin',
    avatar: undefined,
  },
  {
    id: 'user-002',
    email: 'sarah@meridian.com',
    password: 'sarah5678',
    name: 'Sarah Kim',
    company: 'Meridian Consulting LLC',
    role: 'bookkeeper',
  },
]

const SEED_CATEGORIES: Category[] = [
  { id: 'cat-inc-001', name: 'Consulting Revenue',      type: 'income',  code: '4000' },
  { id: 'cat-inc-002', name: 'Product Sales',           type: 'income',  code: '4100' },
  { id: 'cat-inc-003', name: 'Interest Income',         type: 'income',  code: '4200' },
  { id: 'cat-inc-004', name: 'Other Income',            type: 'income',  code: '4900' },
  { id: 'cat-exp-001', name: 'Payroll',                 type: 'expense', code: '5000' },
  { id: 'cat-exp-002', name: 'Rent',                    type: 'expense', code: '5100' },
  { id: 'cat-exp-003', name: 'Utilities',               type: 'expense', code: '5200' },
  { id: 'cat-exp-004', name: 'Office Supplies',         type: 'expense', code: '5300' },
  { id: 'cat-exp-005', name: 'Software Subscriptions',  type: 'expense', code: '5400' },
  { id: 'cat-exp-006', name: 'Professional Services',   type: 'expense', code: '5500' },
  { id: 'cat-exp-007', name: 'Travel',                  type: 'expense', code: '5600' },
  { id: 'cat-exp-008', name: 'Marketing',               type: 'expense', code: '5700' },
  { id: 'cat-exp-009', name: 'Insurance',               type: 'expense', code: '5800' },
  { id: 'cat-exp-010', name: 'Equipment',               type: 'expense', code: '5900' },
  { id: 'cat-exp-011', name: 'Meals & Entertainment',   type: 'expense', code: '6000' },
  { id: 'cat-exp-012', name: 'Bank Fees',               type: 'expense', code: '6100' },
]

const SEED_ACCOUNTS: Account[] = [
  {
    id: 'acc-001',
    name: 'Business Checking - Chase',
    type: 'checking',
    institution: 'Chase Bank',
    balance: 48320.55,
    lastSync: '2026-06-24T08:15:00Z',
    connected: true,
  },
  {
    id: 'acc-002',
    name: 'Business Savings - Chase',
    type: 'savings',
    institution: 'Chase Bank',
    balance: 125000.00,
    lastSync: '2026-06-24T08:15:00Z',
    connected: true,
  },
  {
    id: 'acc-003',
    name: 'Corporate Amex',
    type: 'credit',
    institution: 'American Express',
    balance: -6842.30,
    lastSync: '2026-06-23T22:00:00Z',
    connected: true,
  },
  {
    id: 'acc-004',
    name: 'PayPal Business',
    type: 'payment',
    institution: 'PayPal',
    balance: 3210.80,
    lastSync: '2026-06-24T07:45:00Z',
    connected: true,
  },
  {
    id: 'acc-005',
    name: 'Business Visa - Wells Fargo',
    type: 'credit',
    institution: 'Wells Fargo',
    balance: -2145.60,
    lastSync: '2026-06-23T18:30:00Z',
    connected: false,
  },
]

const SEED_TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-001',
    date: '2026-06-20',
    description: 'Monthly retainer - Apex Technologies',
    amount: 12500.00,
    type: 'income',
    category: 'Consulting Revenue',
    categoryId: 'cat-inc-001',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Apex Technologies Inc.',
    reconciled: true,
  },
  {
    id: 'txn-002',
    date: '2026-06-18',
    description: 'Office lease - June 2026',
    amount: 3800.00,
    type: 'expense',
    category: 'Rent',
    categoryId: 'cat-exp-002',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Westside Commercial Realty',
    reconciled: true,
  },
  {
    id: 'txn-003',
    date: '2026-06-15',
    description: 'Bi-weekly payroll run',
    amount: 18450.00,
    type: 'expense',
    category: 'Payroll',
    categoryId: 'cat-exp-001',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Gusto Payroll',
    reconciled: true,
  },
  {
    id: 'txn-004',
    date: '2026-06-14',
    description: 'Adobe Creative Cloud annual plan',
    amount: 599.88,
    type: 'expense',
    category: 'Software Subscriptions',
    categoryId: 'cat-exp-005',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'Adobe Inc.',
    reconciled: false,
    aiSuggestion: 'Software Subscriptions',
    confidence: 0.97,
  },
  {
    id: 'txn-005',
    date: '2026-06-12',
    description: 'SEO & content marketing services',
    amount: 2200.00,
    type: 'expense',
    category: 'Marketing',
    categoryId: 'cat-exp-008',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'BrightRank Digital Agency',
    reconciled: false,
  },
  {
    id: 'txn-006',
    date: '2026-06-10',
    description: 'Project invoice - Harbor Financial Group',
    amount: 8750.00,
    type: 'income',
    category: 'Consulting Revenue',
    categoryId: 'cat-inc-001',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Harbor Financial Group',
    reconciled: true,
  },
  {
    id: 'txn-007',
    date: '2026-06-09',
    description: 'Flight - NYC to Chicago client visit',
    amount: 412.50,
    type: 'expense',
    category: 'Travel',
    categoryId: 'cat-exp-007',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'United Airlines',
    reconciled: false,
    aiSuggestion: 'Travel',
    confidence: 0.95,
  },
  {
    id: 'txn-008',
    date: '2026-06-08',
    description: 'Amazon Business - printer cartridges and paper',
    amount: 184.32,
    type: 'expense',
    category: 'Office Supplies',
    categoryId: 'cat-exp-004',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'Amazon Business',
    reconciled: false,
  },
  {
    id: 'txn-009',
    date: '2026-06-07',
    description: 'Attorney fees - contract review',
    amount: 1500.00,
    type: 'expense',
    category: 'Professional Services',
    categoryId: 'cat-exp-006',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Harmon & Reed LLP',
    reconciled: false,
  },
  {
    id: 'txn-010',
    date: '2026-06-05',
    description: 'Electricity bill - June',
    amount: 318.45,
    type: 'expense',
    category: 'Utilities',
    categoryId: 'cat-exp-003',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'ConEdison',
    reconciled: true,
  },
  {
    id: 'txn-011',
    date: '2026-06-04',
    description: 'General liability insurance - Q2 premium',
    amount: 945.00,
    type: 'expense',
    category: 'Insurance',
    categoryId: 'cat-exp-009',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Hiscox Business Insurance',
    reconciled: true,
  },
  {
    id: 'txn-012',
    date: '2026-06-03',
    description: 'Slack + Zoom annual subscriptions',
    amount: 856.00,
    type: 'expense',
    category: 'Software Subscriptions',
    categoryId: 'cat-exp-005',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'Slack Technologies / Zoom Video',
    reconciled: false,
  },
  {
    id: 'txn-013',
    date: '2026-06-02',
    description: 'Standing desk and ergonomic chairs x3',
    amount: 2340.00,
    type: 'expense',
    category: 'Equipment',
    categoryId: 'cat-exp-010',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'review',
    merchant: 'Branch Furniture',
    reconciled: false,
    aiSuggestion: 'Equipment',
    confidence: 0.88,
  },
  {
    id: 'txn-014',
    date: '2026-06-01',
    description: 'Client dinner - Apex Technologies team',
    amount: 623.80,
    type: 'expense',
    category: 'Meals & Entertainment',
    categoryId: 'cat-exp-011',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'Nobu Restaurant NYC',
    reconciled: false,
  },
  {
    id: 'txn-015',
    date: '2026-05-30',
    description: 'Product license sale - Nexus Corp',
    amount: 4200.00,
    type: 'income',
    category: 'Product Sales',
    categoryId: 'cat-inc-002',
    account: 'PayPal Business',
    accountId: 'acc-004',
    status: 'categorized',
    merchant: 'Nexus Corp',
    reconciled: true,
  },
  {
    id: 'txn-016',
    date: '2026-05-28',
    description: 'Chase business account monthly fee',
    amount: 30.00,
    type: 'expense',
    category: 'Bank Fees',
    categoryId: 'cat-exp-012',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Chase Bank',
    reconciled: true,
  },
  {
    id: 'txn-017',
    date: '2026-05-25',
    description: 'Hotel - Chicago Marriott (3 nights)',
    amount: 789.00,
    type: 'expense',
    category: 'Travel',
    categoryId: 'cat-exp-007',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'Marriott International',
    reconciled: false,
  },
  {
    id: 'txn-018',
    date: '2026-05-22',
    description: 'Unknown vendor payment',
    amount: 540.00,
    type: 'expense',
    category: '',
    categoryId: '',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'uncategorized',
    merchant: 'PYMT REF 88421',
    reconciled: false,
    aiSuggestion: 'Professional Services',
    confidence: 0.62,
  },
  {
    id: 'txn-019',
    date: '2026-05-20',
    description: 'Google Ads campaign - May',
    amount: 1875.00,
    type: 'expense',
    category: 'Marketing',
    categoryId: 'cat-exp-008',
    account: 'Corporate Amex',
    accountId: 'acc-003',
    status: 'categorized',
    merchant: 'Google LLC',
    reconciled: false,
  },
  {
    id: 'txn-020',
    date: '2026-05-15',
    description: 'Bi-weekly payroll run',
    amount: 18450.00,
    type: 'expense',
    category: 'Payroll',
    categoryId: 'cat-exp-001',
    account: 'Business Checking - Chase',
    accountId: 'acc-001',
    status: 'categorized',
    merchant: 'Gusto Payroll',
    reconciled: true,
  },
]

const SEED_DOCUMENTS: Document[] = [
  {
    id: 'doc-001',
    name: 'INV-2026-0045-Apex-Technologies.pdf',
    type: 'invoice',
    uploadDate: '2026-06-20',
    size: '142 KB',
    status: 'processed',
    clientName: 'Apex Technologies Inc.',
    extractedData: { invoiceNumber: 'INV-2026-0045', amount: '12500.00', dueDate: '2026-07-05' },
  },
  {
    id: 'doc-002',
    name: 'Receipt-United-Airlines-Jun09.pdf',
    type: 'receipt',
    uploadDate: '2026-06-09',
    size: '88 KB',
    status: 'processed',
    extractedData: { merchant: 'United Airlines', amount: '412.50', date: '2026-06-09' },
  },
  {
    id: 'doc-003',
    name: 'Chase-Bank-Statement-May2026.pdf',
    type: 'statement',
    uploadDate: '2026-06-01',
    size: '512 KB',
    status: 'processed',
    extractedData: { bank: 'Chase Bank', period: 'May 2026', closingBalance: '52140.33' },
  },
  {
    id: 'doc-004',
    name: 'INV-2026-0038-Harbor-Financial.pdf',
    type: 'invoice',
    uploadDate: '2026-06-10',
    size: '98 KB',
    status: 'processed',
    clientName: 'Harbor Financial Group',
    extractedData: { invoiceNumber: 'INV-2026-0038', amount: '8750.00', dueDate: '2026-06-25' },
  },
  {
    id: 'doc-005',
    name: 'Hiscox-Insurance-Q2-Premium.pdf',
    type: 'contract',
    uploadDate: '2026-06-04',
    size: '234 KB',
    status: 'processed',
    extractedData: { provider: 'Hiscox', premium: '945.00', period: 'Q2 2026' },
  },
  {
    id: 'doc-006',
    name: 'Amex-Statement-May2026.pdf',
    type: 'statement',
    uploadDate: '2026-06-02',
    size: '389 KB',
    status: 'processed',
    extractedData: { bank: 'American Express', period: 'May 2026', closingBalance: '-5214.20' },
  },
  {
    id: 'doc-007',
    name: 'Harmon-Reed-Invoice-Jun2026.pdf',
    type: 'invoice',
    uploadDate: '2026-06-07',
    size: '76 KB',
    status: 'processed',
    clientName: 'Harmon & Reed LLP',
    extractedData: { invoiceNumber: 'HR-1094', amount: '1500.00', dueDate: '2026-06-21' },
  },
  {
    id: 'doc-008',
    name: 'Receipt-Nobu-Restaurant-Jun01.jpg',
    type: 'receipt',
    uploadDate: '2026-06-02',
    size: '2.1 MB',
    status: 'processed',
    extractedData: { merchant: 'Nobu Restaurant NYC', amount: '623.80', date: '2026-06-01' },
  },
  {
    id: 'doc-009',
    name: 'Form-1099-2025-Draft.pdf',
    type: 'tax',
    uploadDate: '2026-01-28',
    size: '320 KB',
    status: 'processed',
    extractedData: { form: '1099-NEC', taxYear: '2025', totalAmount: '84200.00' },
  },
  {
    id: 'doc-010',
    name: 'Branch-Furniture-Receipt-Jun02.pdf',
    type: 'receipt',
    uploadDate: '2026-06-03',
    size: '155 KB',
    status: 'processed',
    extractedData: { merchant: 'Branch Furniture', amount: '2340.00', date: '2026-06-02' },
  },
  {
    id: 'doc-011',
    name: 'Nexus-Corp-License-Agreement.pdf',
    type: 'contract',
    uploadDate: '2026-05-29',
    size: '440 KB',
    status: 'processed',
    clientName: 'Nexus Corp',
    extractedData: { contractValue: '4200.00', startDate: '2026-06-01', term: '12 months' },
  },
  {
    id: 'doc-012',
    name: 'ConEdison-Invoice-June2026.pdf',
    type: 'invoice',
    uploadDate: '2026-06-06',
    size: '64 KB',
    status: 'processing',
    extractedData: {},
  },
  {
    id: 'doc-013',
    name: 'Google-Ads-May2026-Summary.pdf',
    type: 'receipt',
    uploadDate: '2026-05-31',
    size: '203 KB',
    status: 'pending',
  },
]

const SEED_RECONCILIATIONS: Reconciliation[] = [
  {
    id: 'rec-001',
    accountId: 'acc-001',
    accountName: 'Business Checking - Chase',
    period: 'May 2026',
    status: 'completed',
    matchedCount: 42,
    unmatchedCount: 0,
    totalItems: 42,
    completedDate: '2026-06-03',
  },
  {
    id: 'rec-002',
    accountId: 'acc-001',
    accountName: 'Business Checking - Chase',
    period: 'June 2026',
    status: 'in_progress',
    matchedCount: 18,
    unmatchedCount: 3,
    totalItems: 24,
  },
  {
    id: 'rec-003',
    accountId: 'acc-003',
    accountName: 'Corporate Amex',
    period: 'May 2026',
    status: 'completed',
    matchedCount: 27,
    unmatchedCount: 0,
    totalItems: 27,
    completedDate: '2026-06-04',
  },
  {
    id: 'rec-004',
    accountId: 'acc-003',
    accountName: 'Corporate Amex',
    period: 'June 2026',
    status: 'pending',
    matchedCount: 0,
    unmatchedCount: 0,
    totalItems: 14,
  },
  {
    id: 'rec-005',
    accountId: 'acc-002',
    accountName: 'Business Savings - Chase',
    period: 'May 2026',
    status: 'completed',
    matchedCount: 5,
    unmatchedCount: 0,
    totalItems: 5,
    completedDate: '2026-06-03',
  },
  {
    id: 'rec-006',
    accountId: 'acc-004',
    accountName: 'PayPal Business',
    period: 'May 2026',
    status: 'completed',
    matchedCount: 11,
    unmatchedCount: 1,
    totalItems: 12,
    completedDate: '2026-06-05',
  },
]

const SEED_REPORT_CONFIGS: ReportConfig[] = [
  {
    id: 'rpt-001',
    name: 'Profit & Loss Statement',
    type: 'pnl',
    lastGenerated: '2026-06-20T09:30:00Z',
    period: 'June 2026',
  },
  {
    id: 'rpt-002',
    name: 'Balance Sheet',
    type: 'balance_sheet',
    lastGenerated: '2026-06-20T09:32:00Z',
    period: 'June 2026',
  },
  {
    id: 'rpt-003',
    name: 'Cash Flow Statement',
    type: 'cash_flow',
    lastGenerated: '2026-06-18T14:15:00Z',
    period: 'Q2 2026',
  },
  {
    id: 'rpt-004',
    name: 'AR Aging Report',
    type: 'ar_aging',
    lastGenerated: '2026-06-21T11:00:00Z',
    period: 'June 2026',
  },
  {
    id: 'rpt-005',
    name: 'Expense Summary by Category',
    type: 'expense_summary',
    lastGenerated: '2026-06-19T16:45:00Z',
    period: 'June 2026',
  },
]

const SEED_CASH_FLOW_FORECAST: ForecastMonth[] = [
  { month: 'Jan 2026', projected: 18000, actual: 21340, revenue: 31200, expenses: 9860 },
  { month: 'Feb 2026', projected: 20000, actual: 19870, revenue: 29500, expenses: 9630 },
  { month: 'Mar 2026', projected: 22000, actual: 24110, revenue: 35800, expenses: 11690 },
  { month: 'Apr 2026', projected: 21000, actual: 20450, revenue: 32100, expenses: 11650 },
  { month: 'May 2026', projected: 23000, actual: 26780, revenue: 38900, expenses: 12120 },
  { month: 'Jun 2026', projected: 25000, actual: 22350, revenue: 36500, expenses: 14150 },
  { month: 'Jul 2026', projected: 24000, revenue: 37000, expenses: 13000 },
  { month: 'Aug 2026', projected: 26000, revenue: 39500, expenses: 13500 },
  { month: 'Sep 2026', projected: 28000, revenue: 42000, expenses: 14000 },
  { month: 'Oct 2026', projected: 27000, revenue: 40800, expenses: 13800 },
  { month: 'Nov 2026', projected: 30000, revenue: 44500, expenses: 14500 },
  { month: 'Dec 2026', projected: 32000, revenue: 47200, expenses: 15200 },
]

// Revenue/expense chart data for the past 12 months
const REVENUE_EXPENSE_CHART = [
  { month: 'Jul 2025', revenue: 28400, expenses: 9800 },
  { month: 'Aug 2025', revenue: 30100, expenses: 10200 },
  { month: 'Sep 2025', revenue: 27800, expenses: 10500 },
  { month: 'Oct 2025', revenue: 32500, expenses: 11100 },
  { month: 'Nov 2025', revenue: 29900, expenses: 10800 },
  { month: 'Dec 2025', revenue: 35200, expenses: 13400 },
  { month: 'Jan 2026', revenue: 31200, expenses: 9860 },
  { month: 'Feb 2026', revenue: 29500, expenses: 9630 },
  { month: 'Mar 2026', revenue: 35800, expenses: 11690 },
  { month: 'Apr 2026', revenue: 32100, expenses: 11650 },
  { month: 'May 2026', revenue: 38900, expenses: 12120 },
  { month: 'Jun 2026', revenue: 36500, expenses: 14150 },
]

// ---------------------------------------------------------------------------
// Seed initializer
// ---------------------------------------------------------------------------

function initSeeds(): void {
  if (!localStorage.getItem('ledgerai_seeded')) {
    storageSet('users', SEED_USERS)
    storageSet('categories', SEED_CATEGORIES)
    storageSet('accounts', SEED_ACCOUNTS)
    storageSet('transactions', SEED_TRANSACTIONS)
    storageSet('documents', SEED_DOCUMENTS)
    storageSet('reconciliations', SEED_RECONCILIATIONS)
    storageSet('report_configs', SEED_REPORT_CONFIGS)
    storageSet('cash_flow_forecast', SEED_CASH_FLOW_FORECAST)
    storageSet('revenue_expense_chart', REVENUE_EXPENSE_CHART)
    localStorage.setItem('ledgerai_seeded', '1')
  }
}

// Run seeds immediately on module load
initSeeds()

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function login(email: string, password: string): Promise<User> {
  await delay()
  const users = storageGet<User[]>('users') ?? SEED_USERS
  const user = users.find(u => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid email or password.')
  const { password: _pw, ...safeUser } = user
  storageSet('current_user_id', user.id)
  return { ...safeUser, password: '' }
}

export async function getCurrentUser(): Promise<User | null> {
  await delay()
  const userId = storageGet<string>('current_user_id')
  if (!userId) return null
  const users = storageGet<User[]>('users') ?? SEED_USERS
  const user = users.find(u => u.id === userId)
  if (!user) return null
  return { ...user, password: '' }
}

export async function logout(): Promise<void> {
  await delay()
  localStorage.removeItem('ledgerai_current_user_id')
}

// ---------------------------------------------------------------------------
// Transactions
// ---------------------------------------------------------------------------

export async function getTransactions(): Promise<Transaction[]> {
  await delay()
  return storageGet<Transaction[]>('transactions') ?? SEED_TRANSACTIONS
}

export async function createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
  await delay()
  const transactions = storageGet<Transaction[]>('transactions') ?? []
  const newTxn: Transaction = { ...data, id: `txn-${uid()}` }
  storageSet('transactions', [newTxn, ...transactions])
  return newTxn
}

export async function updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
  await delay()
  const transactions = storageGet<Transaction[]>('transactions') ?? []
  const index = transactions.findIndex(t => t.id === id)
  if (index === -1) throw new Error(`Transaction ${id} not found.`)
  const updated = { ...transactions[index], ...data }
  transactions[index] = updated
  storageSet('transactions', transactions)
  return updated
}

export async function deleteTransaction(id: string): Promise<void> {
  await delay()
  const transactions = storageGet<Transaction[]>('transactions') ?? []
  storageSet('transactions', transactions.filter(t => t.id !== id))
}

export async function categorizeTransaction(
  id: string,
  categoryId: string,
  categoryName: string,
): Promise<Transaction> {
  return updateTransaction(id, { categoryId, category: categoryName, status: 'categorized' })
}

// ---------------------------------------------------------------------------
// Accounts
// ---------------------------------------------------------------------------

export async function getAccounts(): Promise<Account[]> {
  await delay()
  return storageGet<Account[]>('accounts') ?? SEED_ACCOUNTS
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function getDocuments(): Promise<Document[]> {
  await delay()
  return storageGet<Document[]>('documents') ?? SEED_DOCUMENTS
}

export async function uploadDocument(data: Omit<Document, 'id'>): Promise<Document> {
  await delay()
  const documents = storageGet<Document[]>('documents') ?? []
  const newDoc: Document = { ...data, id: `doc-${uid()}` }
  storageSet('documents', [newDoc, ...documents])
  return newDoc
}

export async function deleteDocument(id: string): Promise<void> {
  await delay()
  const documents = storageGet<Document[]>('documents') ?? []
  storageSet('documents', documents.filter(d => d.id !== id))
}

// ---------------------------------------------------------------------------
// Reconciliations
// ---------------------------------------------------------------------------

export async function getReconciliations(): Promise<Reconciliation[]> {
  await delay()
  return storageGet<Reconciliation[]>('reconciliations') ?? SEED_RECONCILIATIONS
}

export async function updateReconciliation(
  id: string,
  data: Partial<Reconciliation>,
): Promise<Reconciliation> {
  await delay()
  const list = storageGet<Reconciliation[]>('reconciliations') ?? []
  const index = list.findIndex(r => r.id === id)
  if (index === -1) throw new Error(`Reconciliation ${id} not found.`)
  const updated = { ...list[index], ...data }
  list[index] = updated
  storageSet('reconciliations', list)
  return updated
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  await delay()
  return storageGet<Category[]>('categories') ?? SEED_CATEGORIES
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------

export async function getReports(): Promise<ReportConfig[]> {
  await delay()
  return storageGet<ReportConfig[]>('report_configs') ?? SEED_REPORT_CONFIGS
}

export async function getReportConfigs(): Promise<ReportConfig[]> {
  return getReports()
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getDashboardKPIs(): Promise<KPI[]> {
  await delay()
  const transactions = storageGet<Transaction[]>('transactions') ?? SEED_TRANSACTIONS
  const currentMonthIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith('2026-06'))
    .reduce((sum, t) => sum + t.amount, 0)
  const currentMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith('2026-06'))
    .reduce((sum, t) => sum + t.amount, 0)
  const prevMonthIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith('2026-05'))
    .reduce((sum, t) => sum + t.amount, 0)
  const prevMonthExpenses = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith('2026-05'))
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = currentMonthIncome - currentMonthExpenses
  const prevNetProfit = prevMonthIncome - prevMonthExpenses

  return [
    {
      label: 'Total Revenue',
      value: currentMonthIncome,
      change: prevMonthIncome > 0 ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0,
      prefix: '$',
    },
    {
      label: 'Total Expenses',
      value: currentMonthExpenses,
      change: prevMonthExpenses > 0 ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0,
      prefix: '$',
    },
    {
      label: 'Net Profit',
      value: netProfit,
      change: prevNetProfit !== 0 ? ((netProfit - prevNetProfit) / Math.abs(prevNetProfit)) * 100 : 0,
      prefix: '$',
    },
    {
      label: 'Uncategorized Transactions',
      value: transactions.filter(t => t.status === 'uncategorized').length,
      change: -12.5,
      suffix: ' items',
    },
  ]
}

export async function getRevenueExpenseChart(): Promise<{ month: string; revenue: number; expenses: number }[]> {
  await delay()
  return storageGet<{ month: string; revenue: number; expenses: number }[]>('revenue_expense_chart')
    ?? REVENUE_EXPENSE_CHART
}

export async function getCashFlowForecast(): Promise<ForecastMonth[]> {
  await delay()
  return storageGet<ForecastMonth[]>('cash_flow_forecast') ?? SEED_CASH_FLOW_FORECAST
}
