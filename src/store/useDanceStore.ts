import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnalysisResult, PracticeVideo, Project, VideoAsset, VideoKind } from '@/data/types'
import { createMockAnalysis } from '@/features/analysis/scoring'

interface DanceState {
  projects: Project[]
  videos: VideoAsset[]
  practices: PracticeVideo[]
  analyses: AnalysisResult[]
  createProject: (name: string, note?: string) => Project
  deleteProject: (projectId: string) => void
  addVideo: (projectId: string, type: VideoKind, file: File) => VideoAsset | PracticeVideo
  calibratePractice: (practiceId: string, offsetTime: number) => void
  analyzePractice: (practiceId: string) => AnalysisResult | undefined
  getProject: (projectId: string) => Project | undefined
}

const now = () => new Date().toISOString()

export const useDanceStore = create<DanceState>()(
  persist(
    (set, get) => ({
      projects: [],
      videos: [],
      practices: [],
      analyses: [],
      createProject: (name, note) => {
        const project: Project = { id: crypto.randomUUID(), name, note, createdAt: now(), updatedAt: now() }
        set((state) => ({ projects: [project, ...state.projects] }))
        return project
      },
      deleteProject: (projectId) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== projectId),
        videos: state.videos.filter((video) => video.projectId !== projectId),
        practices: state.practices.filter((video) => video.projectId !== projectId),
        analyses: state.analyses.filter((analysis) => analysis.projectId !== projectId),
      })),
      addVideo: (projectId, type, file) => {
        const base = {
          id: crypto.randomUUID(),
          projectId,
          type,
          name: file.name,
          objectUrl: URL.createObjectURL(file),
          createdAt: now(),
        }

        if (type === 'master') {
          const video = base as VideoAsset
          set((state) => ({
            videos: [video, ...state.videos.filter((item) => !(item.projectId === projectId && item.type === 'master'))],
            projects: state.projects.map((project) => project.id === projectId ? { ...project, masterVideoId: video.id, updatedAt: now() } : project),
          }))
          return video
        }

        const practice: PracticeVideo = { ...base, type: 'practice', status: 'idle' }
        set((state) => ({
          practices: [practice, ...state.practices],
          projects: state.projects.map((project) => project.id === projectId ? { ...project, updatedAt: now() } : project),
        }))
        return practice
      },
      calibratePractice: (practiceId, offsetTime) => set((state) => ({
        practices: state.practices.map((practice) => practice.id === practiceId ? { ...practice, offsetTime, status: 'calibrated' } : practice),
      })),
      analyzePractice: (practiceId) => {
        const state = get()
        const practice = state.practices.find((item) => item.id === practiceId)
        if (!practice) return undefined
        const master = state.videos.find((item) => item.projectId === practice.projectId && item.type === 'master')
        if (!master) return undefined
        const result = createMockAnalysis(practice.projectId, master, practice)
        set((current) => ({
          analyses: [result, ...current.analyses.filter((item) => item.practiceVideoId !== practiceId)],
          practices: current.practices.map((item) => item.id === practiceId ? { ...item, status: 'complete', latestAnalysisId: result.id } : item),
        }))
        return result
      },
      getProject: (projectId) => get().projects.find((project) => project.id === projectId),
    }),
    {
      name: 'dance-trace-store',
      partialize: (state) => ({
        projects: state.projects,
        videos: state.videos,
        practices: state.practices,
        analyses: state.analyses,
      }),
    },
  ),
)
