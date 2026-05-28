import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'
import type { Slide, SlideBackground, SlideTheme, ScreenMode } from '@/types/presentation'
import { DEFAULT_THEME, DEFAULT_BACKGROUND } from '@/types/presentation'
import { getSocket } from '@/lib/socket'
import type {
  OutputSlidePayload,
  OutputModePayload,
  OutputBackgroundPayload,
} from '@/types'

interface PresentationStore {
  // ── State ──────────────────────────────────
  slideQueue: Slide[]
  currentIndex: number
  mode: ScreenMode
  background: SlideBackground
  theme: SlideTheme
  logoUrl: string
  queueId: string
  transition: import('@/lib/transitions').TransitionType
  transitionMs: number

  // ── Derived (computed) ─────────────────────
  currentSlide: Slide | null
  nextSlide: Slide | null
  totalSlides: number

  // ── Actions ────────────────────────────────
  loadSlides: (slides: Slide[], background?: SlideBackground, theme?: Partial<SlideTheme>) => void
  clearQueue: () => void

  goNext: () => void
  goPrev: () => void
  goTo: (index: number) => void

  setMode: (mode: ScreenMode) => void
  toggleBlack: () => void
  toggleClear: () => void
  toggleLogo: () => void

  setBackground: (bg: SlideBackground) => void
  setTheme: (theme: Partial<SlideTheme>) => void
  setLogoUrl: (url: string) => void
  setTransition: (type: import('@/lib/transitions').TransitionType, durationMs?: number) => void

  // Internal: emit current state to socket
  _emit: () => void
}

export const usePresentationStore = create<PresentationStore>()(
  persist(
    subscribeWithSelector((set, get) => ({
    // ── Initial state ────────────────────────
    slideQueue: [],
    currentIndex: 0,
    mode: 'normal',
    background: DEFAULT_BACKGROUND,
    theme: DEFAULT_THEME,
    logoUrl: '',
    queueId: '',
    transition: 'fade',
    transitionMs: 400,

    // ── Derived ──────────────────────────────
    get currentSlide() {
      const { slideQueue, currentIndex } = get()
      return slideQueue[currentIndex] ?? null
    },
    get nextSlide() {
      const { slideQueue, currentIndex } = get()
      return slideQueue[currentIndex + 1] ?? null
    },
    get totalSlides() {
      return get().slideQueue.length
    },

    // ── Load / clear ─────────────────────────
    loadSlides: (slides, background, themeOverride) => {
      const newQueueId = crypto.randomUUID()
      set((state) => ({
        slideQueue: slides,
        currentIndex: 0,
        queueId: newQueueId,
        background: background ?? state.background,
        theme: themeOverride ? { ...state.theme, ...themeOverride } : state.theme,
        mode: 'normal',
      }))
      get()._emit()
    },

    clearQueue: () => {
      set({ slideQueue: [], currentIndex: 0, queueId: '', mode: 'normal' })
      get()._emit()
    },

    // ── Navigation ───────────────────────────
    goNext: () => {
      const { currentIndex, slideQueue } = get()
      if (currentIndex < slideQueue.length - 1) {
        set({ currentIndex: currentIndex + 1 })
        get()._emit()
      }
    },

    goPrev: () => {
      const { currentIndex } = get()
      if (currentIndex > 0) {
        set({ currentIndex: currentIndex - 1 })
        get()._emit()
      }
    },

    goTo: (index) => {
      const { slideQueue } = get()
      if (index >= 0 && index < slideQueue.length) {
        set({ currentIndex: index })
        get()._emit()
      }
    },

    // ── Screen modes ─────────────────────────
    setMode: (mode) => {
      set({ mode })
      const socket = getSocket()
      socket.emit('output:mode', { mode } satisfies OutputModePayload)
    },

    toggleBlack: () => {
      const { mode, setMode } = get()
      setMode(mode === 'black' ? 'normal' : 'black')
    },

    toggleClear: () => {
      const { mode, setMode } = get()
      setMode(mode === 'clear' ? 'normal' : 'clear')
    },

    toggleLogo: () => {
      const { mode, setMode } = get()
      setMode(mode === 'logo' ? 'normal' : 'logo')
    },

    // ── Background / theme ───────────────────
    setBackground: (background) => {
      set({ background })
      const socket = getSocket()
      socket.emit('output:background', { background } satisfies OutputBackgroundPayload)
    },

    setTheme: (themePartial) => {
      set((state) => ({ theme: { ...state.theme, ...themePartial } }))
      const socket = getSocket()
      socket.emit('output:theme', { theme: get().theme })
    },

    setLogoUrl: (logoUrl) => set({ logoUrl }),

    setTransition: (type, durationMs = 400) => {
      set({ transition: type, transitionMs: durationMs })
      const socket = getSocket()
      socket.emit('output:transition' as any, { type, durationMs })
    },

    // ── Socket emit ──────────────────────────
    _emit: () => {
      const { slideQueue, currentIndex, mode, background, theme, queueId } = get()
      const currentSlide = slideQueue[currentIndex] ?? null
      const nextSlide = slideQueue[currentIndex + 1] ?? null

      const payload: OutputSlidePayload = {
        currentIndex,
        currentSlide,
        nextSlide,
        totalSlides: slideQueue.length,
        queueId,
      }

      const socket = getSocket()
      socket.emit('output:slide', payload)

      // Also update stage display
      socket.emit('stage:update', {
        currentSlide,
        nextSlide,
        currentIndex,
        totalSlides: slideQueue.length,
        mode,
      })
    },
  })),
  {
    name: 'worship-presenter-presentation',
    partialize: (state) => ({
      background:  state.background,
      theme:       state.theme,
      logoUrl:     state.logoUrl,
      transition:  state.transition,
      transitionMs: state.transitionMs,
    }),
  }
))
