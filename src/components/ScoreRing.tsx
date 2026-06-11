interface ScoreRingProps {
  label: string
  score: number
  tone?: 'cyan' | 'orange' | 'green'
}

const toneClass = {
  cyan: 'from-cyan-300 to-teal-400',
  orange: 'from-orange-300 to-amber-500',
  green: 'from-emerald-300 to-teal-500',
}

export function ScoreRing({ label, score, tone = 'cyan' }: ScoreRingProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/20">
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-zinc-950">
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${toneClass[tone]}`}
          style={{ clipPath: `polygon(50% 50%, 50% 0, ${50 + score / 2}% 0, 100% 100%, 0 100%, 0 0)` }}
        />
        <div className="absolute inset-2 rounded-full bg-zinc-950" />
        <div className="relative text-center">
          <div className="text-3xl font-black text-white">{score}</div>
          <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">Score</div>
        </div>
      </div>
      <div className="mt-4 text-center text-sm font-medium text-zinc-300">{label}</div>
    </div>
  )
}
