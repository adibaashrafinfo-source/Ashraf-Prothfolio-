import * as React from 'react'
import { Loader2, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { uploadMedia } from '@/lib/uploadMedia'

interface ImageUploadFieldProps {
  label: string
  folder: string
  value: string | null
  onChange: (url: string | null) => void
  aspectClassName?: string
}

export function ImageUploadField({
  label,
  folder,
  value,
  onChange,
  aspectClassName = 'aspect-video',
}: ImageUploadFieldProps) {
  const { toast } = useToast()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const url = await uploadMedia(file, folder)
      onChange(url)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Could not upload the image.',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div
        className={cn(
          'border-border bg-muted relative w-full max-w-xs overflow-hidden rounded-lg border',
          aspectClassName,
        )}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <div className="text-muted-foreground flex size-full items-center justify-center text-xs">
            No image
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <Loader2 className="size-5 animate-spin text-white" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-3.5" />
          {value ? 'Replace' : 'Upload'}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
            Remove
          </Button>
        )}
      </div>
    </div>
  )
}
