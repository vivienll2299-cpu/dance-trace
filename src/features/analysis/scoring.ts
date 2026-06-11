import type { AnalysisResult, ConfidenceLevel, IssueMarker, PracticeVideo, VideoAsset } from '@/data/types'

const issueTemplates = [
  {
    type: 'rhythm',
    label: '慢半拍',
    description: '动作切换比 Master 晚，影响节奏连贯性。',
    evidence: 'Practice 的关键动作进入点晚于 Master，系统判定为节奏滞后。',
    suggestion: '单独循环这一小节，先跟拍数进入动作，再逐步恢复原速。',
  },
  {
    type: 'pose',
    label: '手臂幅度不足',
    description: '上肢展开角度偏小，动作轮廓不够清晰。',
    evidence: '肩-肘-腕方向与 Master 偏差较大，手臂末端位置偏内收。',
    suggestion: '回看该秒左右的上半身动作，重点放大手臂延展和定点位置。',
  },
  {
    type: 'pose',
    label: '重心偏移',
    description: '下肢支撑和躯干方向与 Master 存在明显偏差。',
    evidence: '髋部中心与肩线方向变化不同步，重心没有落在目标支撑侧。',
    suggestion: '降低速度练习脚步切换，确认重心先到位后再做上肢动作。',
  },
  {
    type: 'rhythm',
    label: '抢拍进入',
    description: '进入下一个动作过早，容易导致后续连贯性下降。',
    evidence: 'Practice 的动作峰值早于 Master，对齐后出现提前完成趋势。',
    suggestion: '听重拍等待半拍后再进入下一动作，避免提前收动作。',
  },
] as const

function clamp(score: number) {
  return Math.max(45, Math.min(96, Math.round(score)))
}

function hashText(text: string) {
  return text.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function confidenceFromOffset(offsetTime: number): ConfidenceLevel {
  if (Math.abs(offsetTime) <= 0.3) return 'high'
  if (Math.abs(offsetTime) <= 1.2) return 'medium'
  return 'low'
}

export function createMockAnalysis(projectId: string, master: VideoAsset, practice: PracticeVideo): AnalysisResult {
  const seed = hashText(`${projectId}-${practice.id}-${practice.offsetTime ?? 0}`)
  const rhythmScore = clamp(88 - (seed % 19) - Math.abs(practice.offsetTime ?? 0) * 4)
  const poseScore = clamp(84 - ((seed / 3) % 17) + ((seed % 5) - 2))
  const overallScore = clamp(rhythmScore * 0.46 + poseScore * 0.54)
  const confidence = confidenceFromOffset(practice.offsetTime ?? 0)
  const issueCount = confidence === 'high' ? 3 : 4

  const issueMarkers: IssueMarker[] = Array.from({ length: issueCount }).map((_, index) => {
    const source = issueTemplates[(seed + index) % issueTemplates.length]
    return {
      id: crypto.randomUUID(),
      time: 8 + index * 11 + (seed % 5),
      type: source.type,
      label: source.label,
      description: source.description,
      evidence: source.evidence,
      suggestion: source.suggestion,
      deduction: index === 0 ? 8 + (seed % 4) : index === 1 ? 5 + (seed % 3) : 3 + (index % 2),
      severity: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
    }
  })

  const confidenceNotes = confidence === 'high'
    ? ['起点校准偏移较小，本次结果具备较高参考价值。']
    : confidence === 'medium'
      ? ['起点存在一定偏移，建议回看问题时间点确认评分是否合理。']
      : ['起点偏移较大，本次结果仅供粗略参考，建议重新校准后再分析。']

  return {
    id: crypto.randomUUID(),
    projectId,
    practiceVideoId: practice.id,
    masterVideoId: master.id,
    offsetTime: practice.offsetTime ?? 0,
    overallScore,
    rhythmScore,
    poseScore,
    confidence,
    confidenceNotes,
    issueMarkers,
    createdAt: new Date().toISOString(),
  }
}
