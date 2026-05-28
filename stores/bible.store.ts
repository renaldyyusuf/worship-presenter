import { create } from 'zustand'
import type { BibleVerse, BibleReference, BibleTranslation, VerseRange } from '@/types/bible'
import type { Slide } from '@/types/presentation'
import { parseBibleReference } from '@/lib/bible-api'
import { versesToSlides } from '@/lib/bible-slides'
import { usePresentationStore } from './presentation.store'
import { toast } from '@/components/shared/Toaster'

interface BibleStore {
  // ── State ──────────────────────────────────
  translation: BibleTranslation
  searchQuery: string
  searchType: 'reference' | 'keyword'
  results: BibleVerse[]
  selectedVerses: BibleVerse[]
  generatedSlides: Slide[]
  isSearching: boolean
  error: string | null
  lastReference: BibleReference | null

  // ── Actions ────────────────────────────────
  setTranslation: (t: BibleTranslation) => void
  setSearchQuery: (q: string) => void
  searchVerses: (query: string, translation?: BibleTranslation) => Promise<void>
  selectVerse: (verse: BibleVerse) => void
  deselectVerse: (verseId: string) => void
  clearSelection: () => void
  generateSlides: (verses: BibleVerse[]) => Slide[]
  loadToPresentation: (verses?: BibleVerse[]) => void
}

export const useBibleStore = create<BibleStore>((set, get) => ({
  translation: 'NIV',
  searchQuery: '',
  searchType: 'reference',
  results: [],
  selectedVerses: [],
  generatedSlides: [],
  isSearching: false,
  error: null,
  lastReference: null,

  setTranslation: (translation) => set({ translation }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  searchVerses: async (query, translation) => {
    const t = translation ?? get().translation
    set({ isSearching: true, error: null, searchQuery: query })

    try {
      // Detect if it's a reference (e.g. "John 3:16") or keyword
      const ref = parseBibleReference(query)
      const searchType = ref ? 'reference' : 'keyword'

      const params = new URLSearchParams({
        q: query,
        translation: t,
        type: searchType,
      })

      const res = await fetch(`/api/bible?${params}`)
      if (!res.ok) throw new Error('Bible search failed')

      const data = await res.json()
      const results: BibleVerse[] = data.verses ?? []

      set({
        results,
        searchType,
        lastReference: ref ?? null,
        isSearching: false,
        // Auto-select all results when it's a reference query
        selectedVerses: ref ? results : [],
        generatedSlides: ref ? versesToSlides(results) : [],
      })
    } catch (err) {
      set({ error: (err as Error).message, isSearching: false })
      toast.error('Bible search failed', (err as Error).message)
    }
  },

  selectVerse: (verse) => {
    set((state) => {
      const already = state.selectedVerses.find((v) => v.id === verse.id)
      if (already) return state
      const updated = [...state.selectedVerses, verse].sort(
        (a, b) => a.chapter - b.chapter || a.verse - b.verse
      )
      return {
        selectedVerses: updated,
        generatedSlides: versesToSlides(updated),
      }
    })
  },

  deselectVerse: (verseId) => {
    set((state) => {
      const updated = state.selectedVerses.filter((v) => v.id !== verseId)
      return {
        selectedVerses: updated,
        generatedSlides: versesToSlides(updated),
      }
    })
  },

  clearSelection: () => set({ selectedVerses: [], generatedSlides: [] }),

  generateSlides: (verses) => {
    const slides = versesToSlides(verses)
    set({ generatedSlides: slides })
    return slides
  },

  loadToPresentation: (verses) => {
    const v = verses ?? get().selectedVerses
    if (v.length === 0) return
    const slides = versesToSlides(v)
    usePresentationStore.getState().loadSlides(slides)
    const ref = v[0]
    toast.info(`Presenting: ${ref.book} ${ref.chapter}:${ref.verse}`)
  },
}))
