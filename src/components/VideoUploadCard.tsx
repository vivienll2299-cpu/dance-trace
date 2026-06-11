import { UploadCloud } from 'lucide-react'
import type { VideoKind } from '@/data/types'

interface VideoUploadCardProps {
  title: string
  description: string
  type: VideoKind
  onUpload: (type: VideoKind, file: File) => void
}

export function VideoUploadCard({ title, description, type, onUpload }: VideoUploadCardProps) {
  return (
    <label className="group flex cursor-pointer flex-col gap-4 rounded-3xl border border-dashed border-white/15 bg-zinc-950/70 p-6 transition hover:border-cyan-300/60 hover:bg-cyan-300/[0.04]">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 transition group-hover:scale-105">
        <UploadCloud size={22} />
      </div>
      <div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
      </div>
      <input
        className="hidden"
        type="file"
        accept="video/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onUpload(type, file)
          event.currentTarget.value = ''
        }}
      />
    </label>
  )
}
