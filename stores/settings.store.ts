import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { toast } from '@/components/shared/Toaster'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ChurchProfile {
  name:     string
  timezone: string
  logoUrl:  string
}

export interface OutputConfig {
  showProgressBar:  boolean
  showSectionLabel: boolean
  showSlideNumber:  boolean
  logoUrl:          string
}

export interface StageConfig {
  showClock:     boolean
  showTimer:     boolean
  showNextSlide: boolean
  showMessage:   boolean
}

export interface TranslationConfig {
  default:   string
  available: string[]
}

interface SettingsStore {
  // ── State ──────────────────────────────────
  profile:     ChurchProfile
  output:      OutputConfig
  stage:       StageConfig
  translation: TranslationConfig
  isLoading:   boolean
  isSaving:    boolean

  // ── Actions ────────────────────────────────
  fetchSettings: () => Promise<void>
  updateProfile: (patch: Partial<ChurchProfile>) => Promise<void>
  updateOutput:  (patch: Partial<OutputConfig>)  => Promise<void>
  updateStage:   (patch: Partial<StageConfig>)   => Promise<void>
  updateTranslation: (patch: Partial<TranslationConfig>) => Promise<void>
  uploadLogo:    (file: File) => Promise<string | null>
}

// ─────────────────────────────────────────────
// Defaults
// ─────────────────────────────────────────────
const DEFAULTS = {
  profile: {
    name:     'My Church',
    timezone: 'America/New_York',
    logoUrl:  '',
  },
  output: {
    showProgressBar:  true,
    showSectionLabel: true,
    showSlideNumber:  false,
    logoUrl:          '',
  },
  stage: {
    showClock:     true,
    showTimer:     true,
    showNextSlide: true,
    showMessage:   true,
  },
  translation: {
    default:   'NIV',
    available: ['KJV', 'NIV', 'ESV', 'WEB'],
  },
}

// ─────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      isLoading: false,
      isSaving:  false,

      fetchSettings: async () => {
        set({ isLoading: true })
        try {
          const res      = await fetch('/api/settings')
          if (!res.ok) throw new Error('Failed to fetch settings')
          const data     = await res.json()
          set({
            profile:     { ...DEFAULTS.profile,     ...(data.profile     ?? {}) },
            output:      { ...DEFAULTS.output,      ...(data.output      ?? {}) },
            stage:       { ...DEFAULTS.stage,       ...(data.stage       ?? {}) },
            translation: { ...DEFAULTS.translation, ...(data.translation ?? {}) },
            isLoading:   false,
          })
        } catch {
          set({ isLoading: false })
        }
      },

      updateProfile: async (patch) => {
        const updated = { ...get().profile, ...patch }
        set({ profile: updated, isSaving: true })
        try {
          await fetch('/api/settings', {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ profile: updated }),
          })
          toast.success('Church profile saved')
        } catch {
          toast.error('Failed to save profile')
        } finally {
          set({ isSaving: false })
        }
      },

      updateOutput: async (patch) => {
        const updated = { ...get().output, ...patch }
        set({ output: updated, isSaving: true })
        try {
          await fetch('/api/settings', {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ output: updated }),
          })
        } catch {
          toast.error('Failed to save output settings')
        } finally {
          set({ isSaving: false })
        }
      },

      updateStage: async (patch) => {
        const updated = { ...get().stage, ...patch }
        set({ stage: updated })
        await fetch('/api/settings', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ stage: updated }),
        }).catch(() => {})
      },

      updateTranslation: async (patch) => {
        const updated = { ...get().translation, ...patch }
        set({ translation: updated })
        await fetch('/api/settings', {
          method:  'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ translation: updated }),
        }).catch(() => {})
      },

      uploadLogo: async (file) => {
        const form = new FormData()
        form.append('file', file)
        form.append('name', 'church-logo')
        try {
          const res  = await fetch('/api/media', { method: 'POST', body: form })
          const item = await res.json()
          const url  = item.cdnUrl as string
          // Update both profile and output logoUrl
          await get().updateProfile({ logoUrl: url })
          await get().updateOutput({ logoUrl: url })
          return url
        } catch {
          toast.error('Failed to upload logo')
          return null
        }
      },
    }),
    {
      name:    'worship-presenter-settings',
      // Only persist client-side prefs; server-side config is fetched on load
      partialize: (state) => ({
        profile:     state.profile,
        output:      state.output,
        stage:       state.stage,
        translation: state.translation,
      }),
    }
  )
)
