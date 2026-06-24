import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  motion,
  useInView,
  AnimatePresence,
} from 'framer-motion'
import { useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import {
  Brain,
  GitCompare,
  BarChart3,
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Star,
  Check,
  ChevronDown,
  Globe,
  Mail,
  ExternalLink,
  Menu,
  X,
  Zap,
  Shield,
  ArrowRight,
  PieChart,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function RevealSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.15 })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── 1. Navigation ────────────────────────────────────────────────────────────

function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const navLinks = [
    { label: 'Features', id: 'features' },
    { label: 'How It Works', id: 'how-it-works' },
    { label: 'Pricing', id: 'pricing' },
    { label: 'Testimonials', id: 'testimonials' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#0d4f3c] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-[family-name:var(--font-display)] font-bold text-xl text-[#0d4f3c]">
              LedgerAI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className="text-sm font-medium text-slate-600 hover:text-[#0d4f3c] transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/login')}
              className="text-slate-600"
            >
              Sign In
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/register')}
              className="bg-[#0d4f3c] hover:bg-[#0d4f3c]/90 text-white"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-left px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#0d4f3c] hover:bg-slate-50 rounded-md transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button size="sm" className="flex-1 bg-[#0d4f3c] hover:bg-[#0d4f3c]/90 text-white" onClick={() => navigate('/register')}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ─── Mock Dashboard ───────────────────────────────────────────────────────────

function MockDashboard() {
  const bars = [65, 82, 58, 91, 74, 88, 70]
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-3 text-xs text-slate-400 font-mono">LedgerAI Dashboard</span>
      </div>

      <div className="p-5">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Revenue', value: '$84,320', delta: '+12.4%', color: '#0d4f3c' },
            { label: 'Expenses', value: '$31,890', delta: '-3.2%', color: '#d97706' },
            { label: 'Net Profit', value: '$52,430', delta: '+18.7%', color: '#10b981' },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">{kpi.label}</p>
              <p className="text-sm font-bold text-slate-800">{kpi.value}</p>
              <span className="text-xs font-medium" style={{ color: kpi.color }}>
                {kpi.delta}
              </span>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-600">Monthly Revenue</span>
            <span className="text-xs text-slate-400">2024</span>
          </div>
          <div className="flex items-end gap-2 h-20">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <motion.div
                  className="w-full rounded-t-sm"
                  style={{ backgroundColor: i === 4 ? '#0d4f3c' : '#10b981', opacity: i === 4 ? 1 : 0.5 }}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                />
                <span className="text-[9px] text-slate-400">{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-3">
          <p className="text-xs font-semibold text-slate-600 mb-2">Recent Transactions</p>
          {[
            { name: 'AWS Services', amount: '-$234.00', cat: 'Software', color: '#0d4f3c' },
            { name: 'Client Payment', amount: '+$5,400.00', cat: 'Revenue', color: '#10b981' },
            { name: 'Office Supplies', amount: '-$89.50', cat: 'Operations', color: '#d97706' },
          ].map((tx) => (
            <div key={tx.name} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
              <div>
                <p className="text-xs font-medium text-slate-700">{tx.name}</p>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${tx.color}15`, color: tx.color }}
                >
                  {tx.cat}
                </span>
              </div>
              <span
                className="text-xs font-semibold"
                style={{ color: tx.amount.startsWith('+') ? '#10b981' : '#64748b' }}
              >
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── 2. Hero ──────────────────────────────────────────────────────────────────

const floatingIcons = [
  { icon: DollarSign, x: -60, y: -40, delay: 0, size: 36 },
  { icon: BarChart3, x: 80, y: 20, delay: 0.4, size: 32 },
  { icon: TrendingUp, x: -40, y: 80, delay: 0.8, size: 28 },
  { icon: PieChart, x: 100, y: -60, delay: 0.2, size: 30 },
  { icon: Zap, x: -90, y: 40, delay: 1.0, size: 26 },
  { icon: Shield, x: 60, y: 90, delay: 0.6, size: 28 },
]

const stats = [
  { value: '10,000+', label: 'Businesses' },
  { value: '99.7%', label: 'Accuracy' },
  { value: '$2.4M+', label: 'Reconciled Daily' },
  { value: '4.9/5', label: 'Rating' },
]

function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0a3d2e] via-[#0d4f3c] to-[#0f6148] pt-16">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#d97706]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div>
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={0}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-8"
            >
              <Zap className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-xs font-semibold text-white/90 tracking-wide uppercase">
                AI-Powered Bookkeeping
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={1}
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              AI-Powered Bookkeeping That Works{' '}
              <span className="text-[#10b981]">While You Sleep</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={2}
              className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl"
            >
              Automate transaction categorization, bank reconciliation, and financial
              reporting with industry-leading AI. Spend less time on books and more
              time growing your business.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              custom={3}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                className="bg-[#10b981] hover:bg-[#10b981]/90 text-white font-semibold px-8 shadow-lg shadow-emerald-900/30 gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </motion.div>

            {/* Trust signals */}
            <motion.p
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              custom={5}
              className="mt-6 text-white/40 text-sm"
            >
              No credit card required &bull; 14-day free trial &bull; Cancel anytime
            </motion.p>
          </div>

          {/* Right: Mock Dashboard */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="relative"
          >
            {/* Floating icons */}
            {floatingIcons.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={i}
                  className="absolute z-10 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-2 shadow-lg"
                  style={{ left: `calc(50% + ${item.x}px)`, top: `calc(50% + ${item.y}px)` }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + item.delay }}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, delay: item.delay, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Icon className="text-[#10b981]" style={{ width: item.size * 0.5, height: item.size * 0.5 }} />
                  </motion.div>
                </motion.div>
              )
            })}

            <MockDashboard />
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={5}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={5 + i * 0.5}
              className="text-center"
            >
              <p className="text-3xl font-[family-name:var(--font-display)] font-bold text-white mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-white/50">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── 3. Features ──────────────────────────────────────────────────────────────

const features = [
  {
    icon: Brain,
    title: 'AI Transaction Categorization',
    description:
      'Our ML model learns your business patterns and automatically categorizes transactions with 99.7% accuracy, eliminating hours of manual data entry.',
  },
  {
    icon: GitCompare,
    title: 'Bank Reconciliation',
    description:
      'Instantly match transactions across all your accounts. Spot discrepancies and resolve them in seconds with intelligent suggestions.',
  },
  {
    icon: BarChart3,
    title: 'Financial Reporting',
    description:
      'Generate P&L statements, balance sheets, and cash flow reports on demand. Share polished reports with stakeholders in one click.',
  },
  {
    icon: TrendingUp,
    title: 'Cash Flow Forecasting',
    description:
      'See 90 days into your financial future. Our AI analyzes trends and seasonality to give you accurate cash flow projections.',
  },
  {
    icon: FileText,
    title: 'Document Processing',
    description:
      'Upload receipts, invoices, and contracts. AI extracts and codes the data automatically, building a fully auditable paper trail.',
  },
  {
    icon: Users,
    title: 'Fractional CFO Advisory',
    description:
      'Get strategic financial guidance from experienced CFOs who know your numbers cold, at a fraction of the cost of a full-time hire.',
  },
]

function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-[#10b981] uppercase tracking-widest mb-3">
            Features
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-[family-name:var(--font-display)] text-4xl font-bold text-slate-900 mb-4"
          >
            Everything you need, nothing you don't
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 max-w-2xl mx-auto">
            LedgerAI bundles the tools modern businesses need to stay on top of their
            finances, powered by artificial intelligence that actually works.
          </motion.p>
        </RevealSection>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                custom={i * 0.15}
                whileHover={{ scale: 1.02, y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="group relative bg-white border border-slate-200 rounded-2xl p-6 cursor-default hover:shadow-xl hover:shadow-slate-100 hover:border-[#10b981]/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0d4f3c]/5 group-hover:bg-[#0d4f3c]/10 flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-6 h-6 text-[#0d4f3c]" />
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ─── 4. How It Works ─────────────────────────────────────────────────────────

const steps = [
  {
    number: '01',
    icon: Shield,
    title: 'Connect Your Accounts',
    description:
      'Securely link your bank accounts, credit cards, and financial tools using bank-grade 256-bit encryption. Setup takes under 5 minutes.',
  },
  {
    number: '02',
    icon: Brain,
    title: 'AI Categorizes Transactions',
    description:
      'Our AI immediately begins learning your business and categorizing every transaction — payroll, vendor payments, subscriptions, and more.',
  },
  {
    number: '03',
    icon: GitCompare,
    title: 'Review & Reconcile',
    description:
      'Quickly review AI suggestions, approve bulk changes, and flag exceptions. What used to take days now takes minutes.',
  },
  {
    number: '04',
    icon: BarChart3,
    title: 'Get Insights & Reports',
    description:
      'Access real-time dashboards, scheduled reports, and AI-generated insights that tell you exactly what your numbers mean for your business.',
  },
]

function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section id="how-it-works" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-[#10b981] uppercase tracking-widest mb-3">
            How It Works
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-[family-name:var(--font-display)] text-4xl font-bold text-slate-900 mb-4"
          >
            Up and running in minutes
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 max-w-2xl mx-auto">
            No complex setup, no lengthy onboarding. LedgerAI is designed to deliver
            value from day one.
          </motion.p>
        </RevealSection>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="relative"
        >
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#0d4f3c]/20 via-[#10b981]/40 to-[#0d4f3c]/20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  custom={i * 0.2}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="w-24 h-24 rounded-full bg-white border-2 border-[#0d4f3c]/20 flex items-center justify-center shadow-sm">
                      <Icon className="w-8 h-8 text-[#0d4f3c]" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#0d4f3c] flex items-center justify-center shadow-md">
                      <span className="text-white text-[10px] font-bold">{i + 1}</span>
                    </div>
                  </div>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ─── 5. Testimonials ─────────────────────────────────────────────────────────

const testimonials = [
  {
    quote:
      "LedgerAI cut our month-end close from 5 days to half a day. The AI categorization is scary good — it even caught a duplicate vendor payment our team had missed for 3 months.",
    name: 'Sarah Mitchell',
    title: 'CEO',
    company: 'Greenleaf Consulting',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote:
      "As a CFO I've evaluated a dozen bookkeeping platforms. LedgerAI's reconciliation engine is genuinely best-in-class. The cash flow forecasting alone justified the entire subscription.",
    name: 'David Park',
    title: 'CFO',
    company: 'TechBridge Solutions',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote:
      "Running five restaurant locations means thousands of transactions a week. Before LedgerAI I had a bookkeeper working full-time just on categorization. Now it's fully automated.",
    name: 'Maria Rodriguez',
    title: 'Owner',
    company: 'Bella Cucina Restaurant Group',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote:
      "Client trust billing is notoriously tricky for law firms. LedgerAI handles it flawlessly and produces audit-ready reports I can share with the state bar at a moment's notice.",
    name: "James O'Brien",
    title: 'Partner',
    company: "O'Brien & Associates Law",
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote:
      "As a bootstrapped agency, every dollar matters. LedgerAI replaced a $2,400/month bookkeeping firm and gives us better data. The fractional CFO sessions are an unexpected bonus.",
    name: 'Rachel Kim',
    title: 'Founder',
    company: 'Bloom Digital Agency',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
  },
  {
    quote:
      "Manufacturing has complex inventory accounting. LedgerAI handles COGS allocation automatically and integrates with our ERP without a single customization request.",
    name: 'Thomas Wright',
    title: 'CEO',
    company: 'Wright Manufacturing',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
  },
]

function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })])
  const [selectedIndex, setSelectedIndex] = useState(0)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap())
    emblaApi.on('select', onSelect)
    onSelect()
    return () => { emblaApi.off('select', onSelect) }
  }, [emblaApi])

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-[#10b981] uppercase tracking-widest mb-3">
            Testimonials
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-[family-name:var(--font-display)] text-4xl font-bold text-slate-900 mb-4"
          >
            Trusted by businesses like yours
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 max-w-2xl mx-auto">
            From solo consultants to multi-location enterprises, LedgerAI powers the
            finances of thousands of businesses worldwide.
          </motion.p>
        </RevealSection>

        <RevealSection>
          <motion.div variants={fadeIn} custom={0}>
            {/* Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {testimonials.map((t) => (
                  <div key={t.name} className="flex-[0_0_100%] min-w-0 px-4 md:flex-[0_0_50%] lg:flex-[0_0_33.33%]">
                    <div className="h-full bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#d97706] text-[#d97706]" />
                        ))}
                      </div>
                      <blockquote className="text-slate-600 text-sm leading-relaxed mb-6">
                        &ldquo;{t.quote}&rdquo;
                      </blockquote>
                      <div className="flex items-center gap-3 mt-auto">
                        <img
                          src={t.avatar}
                          alt={t.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#10b981]/20"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-400">
                            {t.title}, {t.company}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={scrollPrev}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#0d4f3c] hover:text-[#0d4f3c] transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all duration-300',
                      selectedIndex === i
                        ? 'bg-[#0d4f3c] w-6'
                        : 'bg-slate-300 hover:bg-slate-400',
                    )}
                  />
                ))}
              </div>

              <button
                onClick={scrollNext}
                className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:border-[#0d4f3c] hover:text-[#0d4f3c] transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </RevealSection>
      </div>
    </section>
  )
}

// ─── 6. Pricing ───────────────────────────────────────────────────────────────

const plans = [
  {
    name: 'Starter',
    price: 49,
    description: 'Perfect for freelancers and small businesses just getting started.',
    features: [
      'Up to 500 transactions/mo',
      '1 bank connection',
      'Basic P&L & balance sheet',
      'Email support',
      'Mobile app access',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Professional',
    price: 149,
    description: 'The most popular plan for growing businesses with complex needs.',
    features: [
      'Up to 5,000 transactions/mo',
      '5 bank connections',
      'Advanced financial reports',
      'Cash flow forecasting',
      'Priority support (< 4hr response)',
      'Document processing',
      'QuickBooks sync',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 399,
    description: 'Full-service financial operations for established businesses.',
    features: [
      'Unlimited transactions',
      'Unlimited bank connections',
      'Custom financial reports',
      'Fractional CFO advisory',
      'Dedicated account manager',
      'API access & webhooks',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Get Started',
    popular: false,
  },
]

function PricingSection() {
  const navigate = useNavigate()

  return (
    <section id="pricing" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-[#10b981] uppercase tracking-widest mb-3">
            Pricing
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-[family-name:var(--font-display)] text-4xl font-bold text-slate-900 mb-4"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500 max-w-2xl mx-auto">
            All plans include a 14-day free trial. No credit card required.
          </motion.p>
        </RevealSection>

        <RevealSection>
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                custom={i * 0.15}
                className={cn(
                  'relative rounded-2xl p-8 flex flex-col',
                  plan.popular
                    ? 'bg-[#0d4f3c] text-white shadow-2xl shadow-[#0d4f3c]/30 scale-105 z-10'
                    : 'bg-white border border-slate-200 shadow-sm',
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-[#d97706] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3
                    className={cn(
                      'font-[family-name:var(--font-display)] text-xl font-bold mb-1',
                      plan.popular ? 'text-white' : 'text-slate-900',
                    )}
                  >
                    {plan.name}
                  </h3>
                  <p className={cn('text-sm mb-4', plan.popular ? 'text-white/70' : 'text-slate-500')}>
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        'text-4xl font-bold font-[family-name:var(--font-display)]',
                        plan.popular ? 'text-white' : 'text-slate-900',
                      )}
                    >
                      ${plan.price}
                    </span>
                    <span className={cn('text-sm', plan.popular ? 'text-white/60' : 'text-slate-400')}>
                      /month
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        className={cn('w-4 h-4 mt-0.5 flex-shrink-0', plan.popular ? 'text-[#10b981]' : 'text-[#0d4f3c]')}
                      />
                      <span className={cn('text-sm', plan.popular ? 'text-white/80' : 'text-slate-600')}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    'w-full font-semibold',
                    plan.popular
                      ? 'bg-[#10b981] hover:bg-[#10b981]/90 text-white'
                      : 'bg-[#0d4f3c] hover:bg-[#0d4f3c]/90 text-white',
                  )}
                  onClick={() => navigate('/register')}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  )
}

// ─── 7. FAQ ───────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: 'How does AI categorization work?',
    a: 'LedgerAI uses a fine-tuned large language model trained on millions of business transactions. It analyzes merchant names, amounts, transaction patterns, and your historical data to assign the correct category automatically. The model continuously improves with your feedback.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'Absolutely. We use bank-grade 256-bit AES encryption for data at rest and TLS 1.3 in transit. We are SOC 2 Type II certified, never sell your data, and you retain full ownership. We connect to banks via read-only APIs — we can never move money.',
  },
  {
    q: 'Can I connect multiple bank accounts?',
    a: 'Yes. Starter plans support 1 connection, Professional supports 5, and Enterprise supports unlimited connections. We integrate with over 12,000 financial institutions across the US, UK, Canada, and Australia via Plaid and TrueLayer.',
  },
  {
    q: 'How accurate is the AI categorization?',
    a: 'Our AI achieves 99.7% accuracy across all transaction types. The small percentage of edge cases are flagged for your review rather than guessed incorrectly. Accuracy typically reaches 99.9%+ after 30 days as the model adapts to your specific business.',
  },
  {
    q: 'Do you integrate with QuickBooks?',
    a: 'Yes. Professional and Enterprise plans include a real-time QuickBooks Online sync. We also integrate with Xero, FreshBooks, Wave, Sage, and NetSuite. Data flows bidirectionally so your existing workflows are unaffected.',
  },
  {
    q: 'Can I export my data?',
    a: 'You can export all your data at any time in CSV, Excel, PDF, or JSON formats. Enterprise customers also have API access for custom data pipelines. We believe your data belongs to you — there are no export fees and no lock-in.',
  },
]

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <RevealSection className="text-center mb-16">
          <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold text-[#10b981] uppercase tracking-widest mb-3">
            FAQ
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-[family-name:var(--font-display)] text-4xl font-bold text-slate-900 mb-4"
          >
            Common questions
          </motion.h2>
          <motion.p variants={fadeUp} custom={2} className="text-lg text-slate-500">
            Can't find what you're looking for? Chat with our team.
          </motion.p>
        </RevealSection>

        <RevealSection>
          <div className="flex flex-col divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} custom={i * 0.1}>
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-[family-name:var(--font-display)] font-semibold text-slate-800 pr-4">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300',
                      openIndex === i && 'rotate-180',
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  const navigate = useNavigate()

  return (
    <section className="py-24 bg-gradient-to-br from-[#0a3d2e] via-[#0d4f3c] to-[#0f6148]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealSection>
          <motion.h2
            variants={fadeUp}
            custom={0}
            className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl font-bold text-white mb-6"
          >
            Ready to take back your time?
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
            Join 10,000+ businesses that use LedgerAI to close their books faster,
            stay audit-ready, and make smarter financial decisions.
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-[#10b981] hover:bg-[#10b981]/90 text-white font-semibold px-10 shadow-lg gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white bg-transparent"
            >
              Schedule a Demo
            </Button>
          </motion.div>
          <motion.p variants={fadeUp} custom={3} className="mt-6 text-white/40 text-sm">
            14-day free trial &bull; No credit card required &bull; Cancel anytime
          </motion.p>
        </RevealSection>
      </div>
    </section>
  )
}

// ─── 8. Footer ────────────────────────────────────────────────────────────────

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations', 'API Docs', 'Changelog', 'Status'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Partners', 'Contact'],
  Resources: ['Documentation', 'Help Center', 'Webinars', 'Community', 'Templates', 'Accountant Program'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR', 'SOC 2', 'Data Processing Agreement'],
}

function Footer() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#10b981] flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-[family-name:var(--font-display)] font-bold text-xl text-white">LedgerAI</span>
            </div>
            <p className="text-sm leading-relaxed mb-6 max-w-xs">
              AI-powered bookkeeping that automates the busywork so you can focus on
              growing your business.
            </p>
            {/* Socials */}
            <div className="flex gap-3">
              {[
                { Icon: Globe, label: 'Website' },
                { Icon: Mail, label: 'Email' },
                { Icon: ExternalLink, label: 'Blog' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-[#0d4f3c] hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4">{category}</h4>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        const idMap: Record<string, string> = {
                          Features: 'features',
                          Pricing: 'pricing',
                        }
                        if (idMap[link]) scrollTo(idMap[link])
                      }}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LedgerAI, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTABanner />
      <Footer />
    </div>
  )
}
