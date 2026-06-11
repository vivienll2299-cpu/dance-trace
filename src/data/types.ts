export type VideoKind = 'master' | 'practice'
export type AnalysisStatus = 'idle' | 'calibrated' | 'analyzing' | 'complete' | 'failed'
export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface VideoAsset {
  id: string
  projectId: string
  type: VideoKind
  name: string
  objectUrl?: string
  duration?: number
  createdAt: string
}

export interface Project {
  id: string
  name: string
  note?: string
  createdAt: string
  updatedAt: string
  masterVideoId?: string
}

export interface PracticeVideo extends VideoAsset {
  type: 'practice'
  offsetTime?: number
  status: AnalysisStatus
  latestAnalysisId?: string
}

export interface IssueMarker {
  id: string
  time: number
  type: 'rhythm' | 'pose' | 'confidence'
  label: string
  description: string
  evidence: string
  suggestion: string
  deduction: number
  severity: 'low' | 'medium' | 'high'
}

export interface AnalysisResult {
  id: string
  projectId: string
  practiceVideoId: string
  masterVideoId: string
  offsetTime: number
  overallScore: number
  rhythmScore: number
  poseScore: number
  confidence: ConfidenceLevel
  confidenceNotes: string[]
  issueMarkers: IssueMarker[]
  createdAt: string
}
