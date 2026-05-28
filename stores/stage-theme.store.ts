// ─────────────────────────────────────────────
// Stage store — confidence monitor state
// ─────────────────────────────────────────────

import { create } from 'zustand'
import type { Slide, ScreenMode } from '@/types/presentation'
import type { Theme, ThemeFormValues } from '@/types'
import { getSocket } from '@/lib/socket'

interface StageStore {
  // ── State ──────────────────────────────────
  currentSlide: Slide | null
  nextSlide: Slide | null
  currentIndex: number
  totalSlides: number
  mode: ScreenMode

  message: string
  messageVisible: boolean

  timerEndsAt: number | null   // Unix ms
  timerRunning: boolean
  timerLabel: string

  showClock: boolean
  showTimer: boolean
  showNextSlide: boolean
  showMessage: boolean
  showReference: boolean

  // ── Actions ────────────────────────────────
  // Called by SocketProvider when 'stage:update' fires
  updateFromPresentation: (payload: {
    currentSlide: Slide | null
    nextSlide: Slide | null
    currentIndex: number
    totalSlides: number
    mode: ScreenMode
  }) => void

  setMessage: (message: string) => void
  showMessageBanner: (message: string) => void
  hideMessage: () => void

  startTimer: (durationMs: number, label?: string) => void
  stopTimer: () => void

  toggleClock: () => void
  toggleTimer: () => void
  toggleNextSlide: () => void
  toggleMessage: () => void
}

export const useStageStore = create<StageStore>((set, get) => ({
  currentSlide: null,
  nextSlide: null,
  currentIndex: 0,
  totalSlides: 0,
  mode: 'normal',

  message: '',
  messageVisible: false,

  timerEndsAt: null,
  timerRunning: false,
  timerLabel: '',

  showClock: true,
  showTimer: true,
  showNextSlide: true,
  showMessage: true,
  showReference: true,

  updateFromPresentation: (payload) => set(payload),

  setMessage: (message) => set({ message }),

  showMessageBanner: (message) => {
    set({ message, messageVisible: true })
    const socket = getSocket()
    socket.emit('stage:message', { message, visible: true })
  },

  hideMessage: () => {
    set({ messageVisible: false })
    const socket = getSocket()
    socket.emit('stage:message', { message: get().message, visible: false })
  },

  startTimer: (durationMs, label = '') => {
    const endsAt = Date.now() + durationMs
    set({ timerEndsAt: endsAt, timerRunning: true, timerLabel: label })
    const socket = getSocket()
    socket.emit('stage:timer', { endsAt, running: true, label })
  },

  stopTimer: () => {
    set({ timerEndsAt: null, timerRunning: false })
    const socket = getSocket()
    socket.emit('stage:timer', { endsAt: null, running: false })
  },

  toggleClock: () => set((s) => ({ showClock: !s.showClock })),
  toggleTimer: () => set((s) => ({ showTimer: !s.showTimer })),
  toggleNextSlide: () => set((s) => ({ showNextSlide: !s.showNextSlide })),
  toggleMessage: () => set((s) => ({ showMessage: !s.showMessage })),
}))


// ─────────────────────────────────────────────
// Theme store — global theme management
// ─────────────────────────────────────────────

interface ThemeStore {
  themes: Theme[]
  activeThemeId: string | null
  isLoading: boolean
  isSaving: boolean

  fetchThemes: () => Promise<void>
  createTheme: (values: ThemeFormValues) => Promise<Theme | null>
  updateTheme: (id: string, values: Partial<ThemeFormValues>) => Promise<void>
  deleteTheme: (id: string) => Promise<void>
  setActiveTheme: (id: string) => void
  getActiveTheme: () => Theme | null
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  themes: [],
  activeThemeId: null,
  isLoading: false,
  isSaving: false,

  fetchThemes: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/themes')
      const themes: Theme[] = await res.json()
      const defaultTheme = themes.find((t) => t.isDefault)
      set({
        themes,
        activeThemeId: defaultTheme?.id ?? themes[0]?.id ?? null,
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  createTheme: async (values) => {
    set({ isSaving: true })
    try {
      const res = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const theme: Theme = await res.json()
      set((state) => ({ themes: [...state.themes, theme], isSaving: false }))
      return theme
    } catch {
      set({ isSaving: false })
      return null
    }
  },

  updateTheme: async (id, values) => {
    try {
      await fetch(`/api/themes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      set((state) => ({
        themes: state.themes.map((t) => (t.id === id ? { ...t, ...values } : t)),
      }))
    } catch { /* noop */ }
  },

  deleteTheme: async (id) => {
    try {
      await fetch(`/api/themes/${id}`, { method: 'DELETE' })
      set((state) => ({
        themes: state.themes.filter((t) => t.id !== id),
        activeThemeId: state.activeThemeId === id ? null : state.activeThemeId,
      }))
    } catch { /* noop */ }
  },

  setActiveTheme: (id) => set({ activeThemeId: id }),

  getActiveTheme: () => {
    const { themes, activeThemeId } = get()
    return themes.find((t) => t.id === activeThemeId) ?? null
  },
}))
