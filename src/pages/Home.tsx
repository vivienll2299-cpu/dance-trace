import { useMemo, useState } from 'react'
import { Activity, BarChart3, Clock3, Film, Plus, ShieldAlert, Sparkles, Trash2 } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DualPlayer } from '@/components/DualPlayer'
import { ScoreRing } from '@/components/ScoreRing'
import { VideoUploadCard } from '@/components/VideoUploadCard'
import type { AnalysisResult, PracticeVideo, VideoKind } from '@/data/types'
import { useDanceStore } from '@/store/useDanceStore'

export default function Home() {
  const [name, setName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>()
  const [selectedPracticeId, setSelectedPracticeId] = useState<string>()
  const [offset, setOffset] = useState('0')
  const [selectedIssueTime, setSelectedIssueTime] = useState(0)

  const {
    projects,
    videos,
    practices,
    analyses,
    createProject,
    deleteProject,
    addVideo,
    calibratePractice,
    analyzePractice,
  } = useDanceStore()

  const selectedProject = projects.find((project) => project.id === selectedProjectId) ?? projects[0]
  const projectPractices = practices.filter((practice) => practice.projectId === selectedProject?.id)
  const selectedPractice = projectPractices.find((practice) => practice.id === selectedPracticeId) ?? projectPractices[0]
  const master = videos.find((video) => video.projectId === selectedProject?.id && video.type === 'master')
  const latestAnalysis = analyses.find((analysis) => analysis.practiceVideoId === selectedPractice?.id)

  const trendData = useMemo(() => {
    return analyses
      .filter((analysis) => analysis.projectId === selectedProject?.id)
      .slice()
      .reverse()
      .map((analysis, index) => ({
        name: `V${index + 1}`,
        综合分: analysis.overallScore,
        节奏分: analysis.rhythmScore,
        动作分: analysis.poseScore,
      }))
  }, [analyses, selectedProject?.id])

  const handleCreate = () => {
    if (!name.trim()) return
    const project = createProject(name.trim())
    setName('')
    setSelectedProjectId(project.id)
  }

  const handleUpload = (type: VideoKind, file: File) => {
    if (!selectedProject) return
    const video = addVideo(selectedProject.id, type, file)
    if (type === 'practice') setSelectedPracticeId(video.id)
  }

  const handleAnalyze = (practice?: PracticeVideo) => {
    if (!practice) return
    const result = analyzePractice(practice.id)
    if (result?.issueMarkers[0]) setSelectedIssueTime(result.issueMarkers[0].time)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0e1116] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(32,224,196,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(255,157,66,0.14),transparent_28%)]" />
      <div className="relative grid min-h-screen gap-0 xl:grid-cols-[360px_1fr]">
        <aside className="border-r border-white/10 bg-zinc-950/70 p-6 backdrop-blur">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 px-3 py-1 text-xs text-cyan-100">
              <Sparkles size={14} />
              V1.0 Web/PWA MVP
            </div>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white">DanceTrace</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">围绕同一支舞记录多次练习，用可解释分数和问题回看追踪成长。</p>
          </div>

          <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">新建舞蹈项目</label>
            <div className="mt-3 flex gap-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：Attention 编舞练习"
                className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/70"
              />
              <button onClick={handleCreate} className="rounded-2xl bg-cyan-300 px-4 text-zinc-950 transition hover:bg-cyan-200">
                <Plus size={18} />
              </button>
            </div>
          </section>

          <section className="mt-6 space-y-3">
            {projects.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-6 text-zinc-500">
                先创建一个舞蹈项目，再上传 Master 与 Practice 视频。
              </div>
            ) : projects.map((project) => {
              const count = practices.filter((practice) => practice.projectId === project.id).length
              const active = project.id === selectedProject?.id
              return (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProjectId(project.id)
                    setSelectedPracticeId(undefined)
                  }}
                  className={`w-full rounded-3xl border p-4 text-left transition ${active ? 'border-cyan-300/60 bg-cyan-300/10' : 'border-white/10 bg-white/[0.03] hover:border-white/20'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">{project.name}</div>
                      <div className="mt-2 text-xs text-zinc-500">{count} 个练习版本</div>
                    </div>
                    <Trash2
                      size={16}
                      className="text-zinc-600 hover:text-orange-300"
                      onClick={(event) => {
                        event.stopPropagation()
                        deleteProject(project.id)
                      }}
                    />
                  </div>
                </button>
              )
            })}
          </section>
        </aside>

        <section className="h-screen overflow-y-auto p-6 lg:p-10">
          {!selectedProject ? (
            <EmptyState />
          ) : (
            <div className="mx-auto max-w-7xl space-y-8">
              <Header projectName={selectedProject.name} practiceCount={projectPractices.length} />

              <div className="grid gap-4 lg:grid-cols-2">
                <VideoUploadCard
                  title="上传 Master 标准视频"
                  description={master ? `当前文件：${master.name}` : '每个项目保留一个标准参考视频，用作分析参照。'}
                  type="master"
                  onUpload={handleUpload}
                />
                <VideoUploadCard
                  title="上传 Practice 练习视频"
                  description="围绕同一支舞上传多个练习版本，用于分析和成长趋势。"
                  type="practice"
                  onUpload={handleUpload}
                />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
                <div className="space-y-6">
                  <DualPlayer master={master} practice={selectedPractice} jumpTime={selectedIssueTime} />
                  <PracticeList
                    practices={projectPractices}
                    selectedPracticeId={selectedPractice?.id}
                    onSelect={setSelectedPracticeId}
                  />
                  <TrendPanel data={trendData} />
                </div>

                <div className="space-y-6">
                  <CalibrationPanel
                    offset={offset}
                    disabled={!selectedPractice}
                    onOffsetChange={setOffset}
                    onSave={() => selectedPractice && calibratePractice(selectedPractice.id, Number(offset || 0))}
                    onAnalyze={() => handleAnalyze(selectedPractice)}
                  />
                  <ResultPanel analysis={latestAnalysis} onJump={setSelectedIssueTime} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

function Header({ projectName, practiceCount }: { projectName: string; practiceCount: number }) {
  return (
    <header className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-cyan-100">
            <Activity size={16} />
            当前项目
          </div>
          <h2 className="mt-3 text-3xl font-black text-white lg:text-5xl">{projectName}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">先用手动起点校准跑通主链路，再用问题时间点进入双播放器复盘。</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Stat label="练习版本" value={practiceCount} />
          <Stat label="分析模式" value="规则 MVP" />
        </div>
      </div>
    </header>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4">
      <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</div>
      <div className="mt-2 text-xl font-black text-white">{value}</div>
    </div>
  )
}

function PracticeList({ practices, selectedPracticeId, onSelect }: { practices: PracticeVideo[]; selectedPracticeId?: string; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <Film size={16} />
        Practice 版本
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {practices.length === 0 ? (
          <div className="rounded-3xl border border-white/10 p-5 text-sm text-zinc-500">暂无练习视频。</div>
        ) : practices.map((practice) => (
          <button
            key={practice.id}
            onClick={() => onSelect(practice.id)}
            className={`rounded-3xl border p-4 text-left transition ${practice.id === selectedPracticeId ? 'border-orange-300/70 bg-orange-300/10' : 'border-white/10 bg-black/20 hover:border-white/20'}`}
          >
            <div className="truncate font-medium text-white">{practice.name}</div>
            <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
              <Clock3 size={13} />
              {practice.status === 'complete' ? '已分析' : practice.status === 'calibrated' ? '已校准' : '待校准'}
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function CalibrationPanel({ offset, disabled, onOffsetChange, onSave, onAnalyze }: { offset: string; disabled: boolean; onOffsetChange: (value: string) => void; onSave: () => void; onAnalyze: () => void }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <h3 className="text-lg font-bold text-white">手动起点校准</h3>
      <p className="mt-2 text-sm leading-6 text-zinc-400">V1.0 将手动起点作为稳定主方案。输入 Practice 相对 Master 的偏移秒数。</p>
      <input
        value={offset}
        disabled={disabled}
        onChange={(event) => onOffsetChange(event.target.value)}
        type="number"
        step="0.1"
        className="mt-5 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-cyan-300/70 disabled:cursor-not-allowed disabled:opacity-40"
      />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button disabled={disabled} onClick={onSave} className="rounded-2xl border border-cyan-300/50 px-4 py-3 text-sm font-bold text-cyan-100 disabled:opacity-40">保存校准</button>
        <button disabled={disabled} onClick={onAnalyze} className="rounded-2xl bg-orange-300 px-4 py-3 text-sm font-black text-zinc-950 disabled:opacity-40">生成分析</button>
      </div>
    </section>
  )
}

function ResultPanel({ analysis, onJump }: { analysis?: AnalysisResult; onJump: (time: number) => void }) {
  if (!analysis) {
    return (
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm leading-6 text-zinc-500">
        完成视频上传和起点校准后，点击“生成分析”查看综合分、节奏分、动作分与问题时间点。
      </section>
    )
  }

  return (
    <section className="space-y-5 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <BarChart3 size={16} />
        分析结果
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ScoreRing label="综合分" score={analysis.overallScore} tone="green" />
        <ScoreRing label="节奏分" score={analysis.rhythmScore} tone="orange" />
        <ScoreRing label="动作分" score={analysis.poseScore} />
      </div>
      <div className="rounded-3xl border border-orange-300/20 bg-orange-300/10 p-4">
        <div className="flex items-center gap-2 text-sm font-bold text-orange-100">
          <ShieldAlert size={16} />
          可信度：{analysis.confidence}
        </div>
        <p className="mt-2 text-sm leading-6 text-orange-100/70">{analysis.confidenceNotes.join(' ')}</p>
      </div>
      <div className="space-y-3">
        {analysis.issueMarkers.map((issue) => (
          <button key={issue.id} onClick={() => onJump(issue.time)} className="w-full rounded-3xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-cyan-300/50">
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-white">{issue.label}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-300">{issue.time}s</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{issue.description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

function TrendPanel({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
        <BarChart3 size={16} />
        成长趋势
      </div>
      <div className="h-72">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-3xl border border-white/10 text-sm text-zinc-500">完成至少一次分析后展示趋势。</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="score" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#20E0C4" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#20E0C4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" />
              <YAxis stroke="#71717a" domain={[40, 100]} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16 }} />
              <Area type="monotone" dataKey="综合分" stroke="#20E0C4" fill="url(#score)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 text-center">
        <h2 className="text-3xl font-black text-white">创建你的第一支舞蹈项目</h2>
        <p className="mt-4 text-sm leading-7 text-zinc-400">DanceTrace 会围绕 Master 与多个 Practice 版本建立本地练习记录。</p>
      </div>
    </div>
  )
}
