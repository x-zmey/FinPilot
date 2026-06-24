import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  FileText,
  File,
  FileImage,
  LayoutGrid,
  List,
  Trash2,
  Eye,
  Search,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import { cn, formatDate } from '@/lib/utils'
import { getDocuments, uploadDocument, deleteDocument } from '@/lib/api'
import type { Document } from '@/lib/api'

type DocType = Document['type'] | 'all'

const TYPE_LABELS: Record<Document['type'], string> = {
  invoice: 'Invoice',
  receipt: 'Receipt',
  statement: 'Statement',
  contract: 'Contract',
  tax: 'Tax',
}

function statusVariant(status: Document['status']): 'success' | 'warning' | 'secondary' {
  if (status === 'processed') return 'success'
  if (status === 'processing') return 'warning'
  return 'secondary'
}

function DocIcon({ type, size = 'md' }: { type: Document['type']; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-5 w-5' : 'h-6 w-6'
  const colors: Record<Document['type'], string> = {
    invoice: 'text-blue-500',
    receipt: 'text-emerald-500',
    statement: 'text-purple-500',
    contract: 'text-orange-500',
    tax: 'text-red-500',
  }
  const Icon =
    type === 'receipt' ? FileImage : type === 'statement' ? File : FileText
  return <Icon className={cn(sizeClass, colors[type])} />
}

interface UploadForm {
  name: string
  type: Document['type']
  clientName: string
}

const EMPTY_UPLOAD: UploadForm = { name: '', type: 'invoice', clientName: '' }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<DocType>('all')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [viewDoc, setViewDoc] = useState<Document | null>(null)
  const [uploadForm, setUploadForm] = useState<UploadForm>(EMPTY_UPLOAD)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getDocuments()
    setDocuments(data)
    setLoading(false)
  }

  const filtered = documents.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.name.toLowerCase().includes(q) || (d.clientName ?? '').toLowerCase().includes(q)
    const matchType = typeFilter === 'all' || d.type === typeFilter
    return matchSearch && matchType
  })

  const handleUpload = async () => {
    if (!uploadForm.name) {
      toast.error('Please enter a file name')
      return
    }
    setUploading(true)
    try {
      const newDoc = await uploadDocument({
        name: uploadForm.name.endsWith('.pdf') ? uploadForm.name : `${uploadForm.name}.pdf`,
        type: uploadForm.type,
        uploadDate: new Date().toISOString().slice(0, 10),
        size: '—',
        status: 'processing',
        clientName: uploadForm.clientName || undefined,
        extractedData: {},
      })
      setDocuments(prev => [newDoc, ...prev])
      setUploadForm(EMPTY_UPLOAD)
      setUploadOpen(false)
      toast.success('Document uploaded successfully')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
      toast.success('Document deleted')
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const GridCard = ({ doc }: { doc: Document }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50">
            <DocIcon type={doc.type} />
          </div>
          <Badge variant={statusVariant(doc.status)} className="text-xs capitalize">
            {doc.status}
          </Badge>
        </div>
        <p className="text-sm font-medium text-gray-800 leading-tight truncate mb-1" title={doc.name}>
          {doc.name}
        </p>
        {doc.clientName && (
          <p className="text-xs text-gray-400 truncate mb-1">{doc.clientName}</p>
        )}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span>{formatDate(doc.uploadDate)}</span>
          <span>{doc.size}</span>
        </div>
        <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-7 text-xs"
            onClick={() => setViewDoc(doc)}
          >
            <Eye className="h-3 w-3 mr-1" />View
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:border-red-200"
            onClick={() => handleDelete(doc.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const ListRow = ({ doc }: { doc: Document }) => (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
      <DocIcon type={doc.type} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
        {doc.clientName && <p className="text-xs text-gray-400">{doc.clientName}</p>}
      </div>
      <span className="text-xs text-gray-400 hidden sm:block">{TYPE_LABELS[doc.type]}</span>
      <span className="text-xs text-gray-400 hidden md:block">{formatDate(doc.uploadDate)}</span>
      <span className="text-xs text-gray-400 hidden lg:block w-16 text-right">{doc.size}</span>
      <Badge variant={statusVariant(doc.status)} className="text-xs capitalize hidden sm:inline-flex">
        {doc.status}
      </Badge>
      <div className="flex gap-1 flex-shrink-0">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700" onClick={() => setViewDoc(doc)}>
          <Eye className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500" onClick={() => handleDelete(doc.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{documents.length} documents stored</p>
        </div>
        <Button
          onClick={() => setUploadOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white self-start sm:self-auto"
        >
          <Upload className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-emerald-200 rounded-xl p-8 text-center bg-emerald-50/40 cursor-pointer hover:bg-emerald-50 transition-colors"
        onClick={() => setUploadOpen(true)}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-3">
          <Upload className="h-5 w-5 text-emerald-600" />
        </div>
        <p className="text-sm font-medium text-gray-700">Click to upload documents</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG — invoices, receipts, statements, contracts</p>
      </div>

      {/* Filters + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v as DocType)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="invoice">Invoices</SelectItem>
            <SelectItem value="receipt">Receipts</SelectItem>
            <SelectItem value="statement">Statements</SelectItem>
            <SelectItem value="contract">Contracts</SelectItem>
            <SelectItem value="tax">Tax</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
          <button
            onClick={() => setView('grid')}
            className={cn('flex items-center justify-center p-2 transition-colors', view === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('flex items-center justify-center p-2 transition-colors', view === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Documents */}
      {loading ? (
        view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-11 w-11 rounded-lg mb-3" />
                  <Skeleton className="h-4 w-full mb-1.5" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-gray-100">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        )
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No documents found</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(doc => <GridCard key={doc.id} doc={doc} />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            {filtered.map(doc => <ListRow key={doc.id} doc={doc} />)}
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="doc-name">File Name *</Label>
              <Input
                id="doc-name"
                placeholder="e.g. Invoice-2026-001.pdf"
                value={uploadForm.name}
                onChange={e => setUploadForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-type">Document Type</Label>
              <Select
                value={uploadForm.type}
                onValueChange={v => setUploadForm(f => ({ ...f, type: v as Document['type'] }))}
              >
                <SelectTrigger id="doc-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                  <SelectItem value="statement">Statement</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="doc-client">Client Name</Label>
              <Input
                id="doc-client"
                placeholder="e.g. Apex Technologies"
                value={uploadForm.clientName}
                onChange={e => setUploadForm(f => ({ ...f, clientName: e.target.value }))}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setUploadOpen(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={handleUpload}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-1" />
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={!!viewDoc} onOpenChange={() => setViewDoc(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              {viewDoc && <DocIcon type={viewDoc.type} size="sm" />}
              <span className="truncate">{viewDoc?.name}</span>
            </DialogTitle>
          </DialogHeader>
          {viewDoc && (
            <div className="space-y-4 pt-1">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Type</p>
                  <p className="font-medium text-gray-800 capitalize">{TYPE_LABELS[viewDoc.type]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Status</p>
                  <Badge variant={statusVariant(viewDoc.status)} className="capitalize">{viewDoc.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Uploaded</p>
                  <p className="font-medium text-gray-800">{formatDate(viewDoc.uploadDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">File Size</p>
                  <p className="font-medium text-gray-800">{viewDoc.size}</p>
                </div>
                {viewDoc.clientName && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Client</p>
                    <p className="font-medium text-gray-800">{viewDoc.clientName}</p>
                  </div>
                )}
              </div>
              {viewDoc.extractedData && Object.keys(viewDoc.extractedData).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Extracted Data</p>
                  <div className="rounded-lg bg-gray-50 p-3 space-y-1.5">
                    {Object.entries(viewDoc.extractedData).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium text-gray-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => setViewDoc(null)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
