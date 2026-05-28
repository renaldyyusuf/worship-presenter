import { create } from 'zustand'
import type { Song, SongFormValues } from '@/types/song'
import type { SlideBackground, SlideTheme } from '@/types/presentation'
import { parseLyricsToSections, sectionsToSlides } from '@/lib/lyrics-parser'
import { usePresentationStore } from './presentation.store'
import { toast } from '@/components/shared/Toaster'

interface SongsStore {
  songs: Song[]
  activeSong: Song | null
  searchQuery: string
  filterTags: string[]
  filterCategory: string
  showFavoritesOnly: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null

  fetchSongs: () => Promise<void>
  fetchSong: (id: string) => Promise<Song | null>
  createSong: (values: SongFormValues) => Promise<Song | null>
  updateSong: (id: string, values: Partial<SongFormValues>) => Promise<Song | null>
  deleteSong: (id: string) => Promise<boolean>
  duplicateSong: (id: string) => Promise<Song | null>
  toggleFavorite: (id: string) => Promise<void>

  setActiveSong: (song: Song | null) => void
  setSearchQuery: (query: string) => void
  setFilterTags: (tags: string[]) => void
  setFilterCategory: (category: string) => void
  setShowFavoritesOnly: (val: boolean) => void

  loadToPresentation: (song: Song, background?: SlideBackground, themeOverride?: Partial<SlideTheme>) => void
  reparseSong: (song: Song) => Song
  getFilteredSongs: () => Song[]
}

export const useSongsStore = create<SongsStore>((set, get) => ({
  songs: [],
  activeSong: null,
  searchQuery: '',
  filterTags: [],
  filterCategory: '',
  showFavoritesOnly: false,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchSongs: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/songs')
      if (!res.ok) throw new Error('Failed to fetch songs')
      const songs: Song[] = await res.json()
      set({ songs, isLoading: false })
    } catch (err) {
      const msg = (err as Error).message
      set({ error: msg, isLoading: false })
      toast.error('Failed to load songs', msg)
    }
  },

  fetchSong: async (id) => {
    try {
      const res = await fetch(`/api/songs/${id}`)
      if (!res.ok) return null
      const song: Song = await res.json()
      set((state) => ({
        songs: state.songs.map((s) => (s.id === id ? song : s)),
        activeSong: song,
      }))
      return song
    } catch { return null }
  },

  createSong: async (values) => {
    set({ isSaving: true, error: null })
    try {
      const sections = parseLyricsToSections(values.lyrics)
      const slides   = sectionsToSlides(sections, values.title)
      const res = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, sections, slides }),
      })
      if (!res.ok) throw new Error('Failed to create song')
      const song: Song = await res.json()
      set((state) => ({ songs: [song, ...state.songs], isSaving: false }))
      toast.success('Song created', song.title)
      return song
    } catch (err) {
      const msg = (err as Error).message
      set({ error: msg, isSaving: false })
      toast.error('Failed to create song', msg)
      return null
    }
  },

  updateSong: async (id, values) => {
    set({ isSaving: true, error: null })
    try {
      let extra: Partial<Song> = {}
      if (values.lyrics !== undefined) {
        const sections = parseLyricsToSections(values.lyrics)
        const title    = values.title ?? get().songs.find((s) => s.id === id)?.title ?? ''
        extra = { sections, slides: sectionsToSlides(sections, title) }
      }
      const res = await fetch(`/api/songs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, ...extra }),
      })
      if (!res.ok) throw new Error('Failed to update song')
      const updated: Song = await res.json()
      set((state) => ({
        songs: state.songs.map((s) => (s.id === id ? updated : s)),
        activeSong: state.activeSong?.id === id ? updated : state.activeSong,
        isSaving: false,
      }))
      toast.success('Song saved')
      return updated
    } catch (err) {
      const msg = (err as Error).message
      set({ error: msg, isSaving: false })
      toast.error('Failed to save song', msg)
      return null
    }
  },

  deleteSong: async (id) => {
    try {
      const res = await fetch(`/api/songs/${id}`, { method: 'DELETE' })
      if (!res.ok) return false
      const title = get().songs.find((s) => s.id === id)?.title
      set((state) => ({
        songs: state.songs.filter((s) => s.id !== id),
        activeSong: state.activeSong?.id === id ? null : state.activeSong,
      }))
      toast.success('Song deleted', title)
      return true
    } catch { return false }
  },

  duplicateSong: async (id) => {
    const original = get().songs.find((s) => s.id === id)
    if (!original) return null
    return get().createSong({
      title:      `${original.title} (copy)`,
      artist:     original.artist,
      album:      original.album,
      ccliNumber: original.ccliNumber,
      copyright:  original.copyright,
      lyrics:     original.lyrics,
      tags:       [...original.tags],
      category:   original.category,
      favorite:   false,
    })
  },

  toggleFavorite: async (id) => {
    const song = get().songs.find((s) => s.id === id)
    if (!song) return
    await get().updateSong(id, { favorite: !song.favorite })
  },

  setActiveSong: (song) => set({ activeSong: song }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFilterTags: (filterTags) => set({ filterTags }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setShowFavoritesOnly: (showFavoritesOnly) => set({ showFavoritesOnly }),

  loadToPresentation: (song, background, themeOverride) => {
    const slides = song.slides?.length > 0
      ? song.slides
      : sectionsToSlides(song.sections ?? [], song.title)
    usePresentationStore.getState().loadSlides(slides, background, themeOverride)
    toast.info(`Now presenting: ${song.title}`)
  },

  reparseSong: (song) => {
    const sections = parseLyricsToSections(song.lyrics)
    const slides   = sectionsToSlides(sections, song.title)
    return { ...song, sections, slides }
  },

  getFilteredSongs: () => {
    const { songs, searchQuery, filterTags, filterCategory, showFavoritesOnly } = get()
    const q = searchQuery.toLowerCase()
    return songs.filter((song) => {
      if (showFavoritesOnly && !song.favorite) return false
      if (filterCategory && song.category !== filterCategory) return false
      if (filterTags.length > 0 && !filterTags.every((t) => song.tags.includes(t))) return false
      if (q) {
        const match =
          song.title.toLowerCase().includes(q) ||
          song.artist?.toLowerCase().includes(q) ||
          song.lyrics.toLowerCase().includes(q) ||
          song.tags.some((t) => t.toLowerCase().includes(q))
        if (!match) return false
      }
      return true
    })
  },
}))
