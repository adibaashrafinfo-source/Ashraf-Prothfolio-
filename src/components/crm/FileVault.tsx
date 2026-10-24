import * as React from 'react'
import { Download, FileText, Loader2, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { apiDelete, apiUploadProjectFile, errorMessage, portalUploadProjectFile } from '@/lib/apiClient'
import { fileExt, formatDate, formatFileSize } from '@/lib/crm'
import { cn } from '@/lib/utils'
import type { CrmFile } from '@/types/crm'

const MAX_UPLOAD_MB = 20

/** Admin-facing file vault on a project page: upload deliverables, see client uploads, delete either. */
export function FileVault({
  projectId,
  files,
  onChanged,
}: {
  projectId: string
  files: CrmFile[]
  onChanged: () => void
}) {
  const { toast } = useToast()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const upload = async (file: File) => {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast({ variant: 'destructive', title: `File is too large (max ${MAX_UPLOAD_MB}MB)` })
      return
    }
    setUploading(true)
    try {
      await apiUploadProjectFile(projectId, file)
      toast({ title: 'File shared with client' })
      onChanged()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not upload file', description: errorMessage(err) })
    } finally {
      setUploading(false)
    }
  }

  const remove = async (file: CrmFile) => {
    if (!window.confirm(`Delete "${file.file_name}"?`)) return
    setDeletingId(file.id)
    try {
      await apiDelete(`/crm/files/${file.id}`)
      onChanged()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not delete', description: errorMessage(err) })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) upload(file)
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit gap-2"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
        Upload deliverable
      </Button>

      {files.length === 0 ? (
        <p className="text-muted-foreground text-sm">No files yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {files.map((f) => (
            <li key={f.id} className="border-border bg-card group flex items-center gap-3 rounded-lg border p-3">
              <span
                className={cn(
                  'flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                  f.category === 'deliverable' ? 'bg-primary/10 text-primary' : 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
                )}
              >
                {fileExt(f.file_name)}
              </span>
              <div className="min-w-0 flex-1">
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary block truncate text-sm font-medium"
                  title={f.file_name}
                >
                  {f.file_name}
                </a>
                <p className="text-muted-foreground text-xs">
                  {f.category === 'deliverable' ? 'Shared by you' : 'From client'} · {formatFileSize(f.size)} ·{' '}
                  {formatDate(f.created_at)}
                </p>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Download ${f.file_name}`}
                className="text-muted-foreground hover:text-foreground rounded p-1.5"
              >
                <Download className="size-4" />
              </a>
              <button
                type="button"
                aria-label={`Delete ${f.file_name}`}
                disabled={deletingId === f.id}
                onClick={() => remove(f)}
                className="text-muted-foreground hover:text-destructive rounded p-1.5 disabled:opacity-40"
              >
                {deletingId === f.id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Client portal: shows both deliverables and the client's own uploads, with an upload button for their own assets. */
export function ClientFileSection({
  projectId,
  files,
  onChanged,
}: {
  projectId: string
  files: CrmFile[]
  onChanged: () => void
}) {
  const { toast } = useToast()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const deliverables = files.filter((f) => f.category === 'deliverable')
  const ownUploads = files.filter((f) => f.category === 'client_asset')

  const upload = async (file: File) => {
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      toast({ variant: 'destructive', title: `File is too large (max ${MAX_UPLOAD_MB}MB)` })
      return
    }
    setUploading(true)
    try {
      await portalUploadProjectFile(projectId, file)
      toast({ title: 'File sent' })
      onChanged()
    } catch (err) {
      toast({ variant: 'destructive', title: 'Could not upload file', description: errorMessage(err) })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Shared with you</p>
        {deliverables.length === 0 ? (
          <p className="text-muted-foreground text-sm">Nothing shared yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {deliverables.map((f) => (
              <li key={f.id}>
                <FileRow file={f} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-xs font-semibold tracking-wide uppercase">Your uploads</p>
        {ownUploads.length > 0 && (
          <ul className="mb-2 flex flex-col gap-2">
            {ownUploads.map((f) => (
              <li key={f.id}>
                <FileRow file={f} />
              </li>
            ))}
          </ul>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) upload(file)
          }}
        />
        <Button type="button" variant="outline" size="sm" className="gap-2" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Upload a file (logo, content, images…)
        </Button>
      </div>
    </div>
  )
}

/** Compact read-only row used where a file is referenced without upload/delete actions. */
export function FileRow({ file }: { file: CrmFile }) {
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer"
      className="border-border bg-card hover:border-primary/40 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold">
        {fileExt(file.file_name)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.file_name}</p>
        <p className="text-muted-foreground text-xs">
          {formatFileSize(file.size)} · {formatDate(file.created_at)}
        </p>
      </div>
      <FileText className="text-muted-foreground size-4 shrink-0" />
    </a>
  )
}
