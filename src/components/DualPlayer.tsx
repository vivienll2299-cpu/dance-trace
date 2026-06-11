import { useRef } from 'react'
import { Link2, Play } from 'lucide-react'
import type { PracticeVideo, VideoAsset } from '@/data/types'

interface DualPlayerProps {
  master?: VideoAsset
  practice?: PracticeVideo
  jumpTime?: number
}

export function DualPlayer({ master, practice, jumpTime = 0 }: DualPlayerProps) {
  const masterRef = useRef<HTMLVideoElement>(null)
  const practiceRef = useRef<HTMLVideoElement>(null)

  const jump = () => {
    const offset = practice?.offsetTime ?? 0
    if (masterRef.current) masterRef.current.currentTime = jumpTime
    if (practiceRef.current) practiceRef.current.currentTime = Math.max(0, jumpTime + offset)
  }

  const playBoth = () => {
    jump()
    void masterRef.current?.play()
    void practiceRef.current?.play()
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-zinc-950/70 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
          <Link2 size={16} />
          双播放器同步回看
        </div>
        <button onClick={playBoth} className="inline-flex items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-sm font-bold text-zinc-950">
          <Play size={15} />
          跳转并播放
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <VideoPane label="Master 标准视频" video={master} refProp={masterRef} />
        <VideoPane label="Practice 练习视频" video={practice} refProp={practiceRef} />
      </div>
    </div>
  )
}

function VideoPane({ label, video, refProp }: { label: string; video?: VideoAsset; refProp: React.RefObject<HTMLVideoElement> }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
      <div className="border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">{label}</div>
      {video?.objectUrl ? (
        <video ref={refProp} src={video.objectUrl} className="aspect-video w-full bg-black object-contain" controls />
      ) : (
        <div className="flex aspect-video items-center justify-center text-sm text-zinc-500">请先上传视频</div>
      )}
    </div>
  )
}
