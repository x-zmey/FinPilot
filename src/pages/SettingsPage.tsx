import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  CreditCard,
  Plug,
  Bell,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/stores/authStore'

interface NotifSettings {
  newTransaction: boolean
  reconciliationComplete: boolean
  documentProcessed: boolean
  reportReady: boolean
  weeklyDigest: boolean
  unusualActivity: boolean
}

const INTEGRATIONS = [
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    desc: 'Sync transactions and chart of accounts',
    logo: 'QB',
    color: 'bg-green-100 text-green-700',
    connected: true,
  },
  {
    id: 'xero',
    name: 'Xero',
    desc: 'Bidirectional sync with Xero books',
    logo: 'XR',
    color: 'bg-blue-100 text-blue-700',
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    desc: 'Import payments and payouts automatically',
    logo: 'ST',
    color: 'bg-purple-100 text-purple-700',
    connected: true,
  },
  {
    id: 'plaid',
    name: 'Plaid',
    desc: 'Connect bank accounts for real-time sync',
    logo: 'PL',
    color: 'bg-indigo-100 text-indigo-700',
    connected: true,
  },
]

const PLAN_USAGE = {
  transactions: { used: 847, limit: 1000 },
  documents: { used: 13, limit: 50 },
  accounts: { used: 4, limit: 10 },
}

export default function SettingsPage() {
  const { user } = useAuthStore()

  const [profileForm, setProfileForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    company: user?.company ?? '',
    role: user?.role ?? '',
  })

  const [integrations, setIntegrations] = useState(INTEGRATIONS)

  const [notifications, setNotifications] = useState<NotifSettings>({
    newTransaction: true,
    reconciliationComplete: true,
    documentProcessed: true,
    reportReady: false,
    weeklyDigest: true,
    unusualActivity: true,
  })

  const handleSaveProfile = () => {
    toast.success('Profile saved successfully')
  }

  const handleToggleIntegration = (id: string) => {
    setIntegrations(prev =>
      prev.map(i => {
        if (i.id !== id) return i
        const next = !i.connected
        toast.success(next ? `Connected to ${i.name}` : `Disconnected from ${i.name}`)
        return { ...i, connected: next }
      }),
    )
  }

  const toggleNotif = (key: keyof NotifSettings) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences saved')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-5"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="profile">
            <User className="h-3.5 w-3.5 mr-1.5" />Profile
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-3.5 w-3.5 mr-1.5" />Billing
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-3.5 w-3.5 mr-1.5" />Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-5">
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">Profile Information</CardTitle>
              <p className="text-sm text-gray-500">Update your personal details</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xl font-bold">
                  {profileForm.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{profileForm.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{profileForm.role}</p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-emerald-600 mt-0.5">
                    Change avatar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="s-name">Full Name</Label>
                  <Input
                    id="s-name"
                    value={profileForm.name}
                    onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-email">Email Address</Label>
                  <Input
                    id="s-email"
                    type="email"
                    value={profileForm.email}
                    onChange={e => setProfileForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-company">Company</Label>
                  <Input
                    id="s-company"
                    value={profileForm.company}
                    onChange={e => setProfileForm(f => ({ ...f, company: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="s-role">Role</Label>
                  <Input
                    id="s-role"
                    value={profileForm.role}
                    onChange={e => setProfileForm(f => ({ ...f, role: e.target.value }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700">Change Password</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="s-cur-pw">Current Password</Label>
                    <Input id="s-cur-pw" type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="s-new-pw">New Password</Label>
                    <Input id="s-new-pw" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-5 space-y-4 max-w-2xl">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-800">Current Plan</CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">Professional — billed monthly</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-emerald-700">$79</span>
                  <span className="text-emerald-600 text-sm mb-1">/month</span>
                </div>
                <p className="text-sm text-emerald-700">Professional Plan</p>
                <ul className="mt-3 space-y-1.5 text-sm text-emerald-800">
                  {['Unlimited transactions', '50 documents/month', '10 connected accounts', 'AI categorization', 'Priority support'].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Usage This Month</h4>
                <div className="space-y-3">
                  {Object.entries(PLAN_USAGE).map(([key, { used, limit }]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{key}</span>
                        <span className="text-gray-500 font-medium">{used} / {limit}</span>
                      </div>
                      <Progress value={(used / limit) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Upgrade to Enterprise</p>
                  <p className="text-xs text-gray-400">Unlimited everything, custom integrations, dedicated support</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { date: 'Jun 1, 2026', amount: '$79.00', status: 'Paid' },
                  { date: 'May 1, 2026', amount: '$79.00', status: 'Paid' },
                  { date: 'Apr 1, 2026', amount: '$79.00', status: 'Paid' },
                ].map(item => (
                  <div key={item.date} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm text-gray-700">Professional Plan</p>
                      <p className="text-xs text-gray-400">{item.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-800">{item.amount}</span>
                      <Badge variant="success" className="text-xs">{item.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-5 max-w-2xl">
          <div className="space-y-3">
            {integrations.map(integration => (
              <Card key={integration.id}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${integration.color}`}>
                    {integration.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-800">{integration.name}</p>
                      {integration.connected ? (
                        <div className="flex items-center gap-1 text-xs text-emerald-600">
                          <CheckCircle className="h-3 w-3" />Connected
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <XCircle className="h-3 w-3" />Not connected
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{integration.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant={integration.connected ? 'outline' : 'default'}
                    className={integration.connected
                      ? 'text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'}
                    onClick={() => handleToggleIntegration(integration.id)}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-5 max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-gray-800">Email Notifications</CardTitle>
              <p className="text-sm text-gray-500">Choose what updates you receive by email</p>
            </CardHeader>
            <CardContent className="space-y-1">
              {([
                { key: 'newTransaction', label: 'New Transaction', desc: 'When a new transaction is synced or added' },
                { key: 'reconciliationComplete', label: 'Reconciliation Complete', desc: 'When a reconciliation period is finished' },
                { key: 'documentProcessed', label: 'Document Processed', desc: 'When an uploaded document has been OCR processed' },
                { key: 'reportReady', label: 'Report Ready', desc: 'When a scheduled report has been generated' },
                { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'A summary of activity every Monday morning' },
                { key: 'unusualActivity', label: 'Unusual Activity Alerts', desc: 'Flagged transactions or anomalies detected by AI' },
              ] as { key: keyof NotifSettings; label: string; desc: string }[]).map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                  <button
                    onClick={() => toggleNotif(key)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                      notifications[key] ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        notifications[key] ? 'translate-x-4.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
              <div className="pt-4">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleSaveNotifications}>
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
