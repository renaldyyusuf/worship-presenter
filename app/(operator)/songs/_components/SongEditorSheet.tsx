'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Save, RefreshCw, Tag, ChevronDown } from 'lucide-react'
import { useSongsStore } from '@/stores/songs.store'
import { SONG_CATEGORIES } from '@/types/song'
import type { SongFormValues } from '@/types/song'
import { LyricsEditor } from './LyricsEditor'
import { SlidePreviewGrid } from './SlidePreviewGrid'
import { SlideReorderPanel } from '@/components/songs/SlideReorderPanel'
import { SectionEditor } from './SectionEditor'
import { cn } from '@/lib/utils'

const songSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().optional(),
  album: z.string().optional(),
  ccliNumber: z.string().optional(),
  copyright: z.string().optional(),
  lyrics: z.string().min(1, 'Lyrics are required'),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  favorite: z.boolean().default(false),
})

type Tab = 'lyrics' | 'details' | 'slides'

export function SongEditorSheet() {
  const { activeSong, setActiveSong, createSong, updateSong, isSaving, reparseSong } = useSongsStore()
  const [activeTab, setActiveTab] = useState<Tab>('lyrics')
  const [tagInput, setTagInput] = useState('')
  const [previewSlides, setPreviewSlides] = useState<any[]>([])
  const [parsedSections, setParsedSections] = useState<any[]>([])
  const [slideViewMode, setSlideViewMode] = useState<'preview' | 'reorder'>('preview')

  const isNew = activeSong?.id === 'new'
  const isOpen = !!activeSong

  const form = useForm<SongFormValues>({
    resolver: zodResolver(songSchema),
    defaultValues: {
      title: '', artist: '', album: '', ccliNumber: '',
      copyright: '', lyrics: '', tags: [], category: '', favorite: false,
    },
  })

  // Populate form when activeSong changes
  useEffect(() => {
    if (!activeSong) return
    if (isNew) {
      form.reset({ title: '', artist: '', album: '', ccliNumber: '', copyright: '', lyrics: '', tags: [], category: '', favorite: false })
      setPreviewSlides([])
    } else {
      form.reset({
        title: activeSong.title,
        artist: activeSong.artist ?? '',
        album: activeSong.album ?? '',
        ccliNumber: activeSong.ccliNumber ?? '',
        copyright: activeSong.copyright ?? '',
        lyrics: activeSong.lyrics,
        tags: activeSong.tags,
        category: activeSong.category ?? '',
        favorite: activeSong.favorite,
      })
      setPreviewSlides(activeSong.slides ?? [])
    }
  }, [activeSong?.id])

  // Live slide preview as user types lyrics
  const watchedLyrics = form.watch('lyrics')
  const watchedTitle = form.watch('title')
  useEffect(() => {
    if (!watchedLyrics) return
    const dummy = { lyrics: watchedLyrics, title: watchedTitle } as any
    const parsed = reparseSong(dummy)
    setPreviewSlides(parsed.slides)
  }, [watchedLyrics, watchedTitle])

  const onSubmit = async (values: SongFormValues) => {
    let result
    if (isNew) {
      result = await createSong(values)
    } else if (activeSong) {
      result = await updateSong(activeSong.id, values)
    }
    if (result) setActiveSong(null)
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag) return
    const current = form.getValues('tags') ?? []
    if (!current.includes(tag)) {
      form.setValue('tags', [...current, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    const current = form.getValues('tags') ?? []
    form.setValue('tags', current.filter((t) => t !== tag))
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => setActiveSong(null)}
      />

      {/* Sheet panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[680px] flex flex-col bg-[#0f0f0f] border-l border-white/[0.07] shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {isNew ? 'New Song' : form.watch('title') || 'Edit Song'}
            </h2>
            {!isNew && activeSong && (
              <p className="text-xs text-white/30 mt-0.5">{activeSong.id}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSaving}
              className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {isSaving ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => setActiveSong(null)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/40 hover:bg-white/[0.06] hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-white/[0.06] px-5">
          {(['lyrics', 'details', 'slides'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-2.5 pt-2.5 px-1 mr-5 text-sm capitalize border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-white/40 hover:text-white/60'
              )}
            >
              {tab}
              {tab === 'slides' && previewSlides.length > 0 && (
                <span className="ml-1.5 text-[11px] text-white/25">{previewSlides.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'lyrics' && (
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Song Title *</label>
                <input
                  {...form.register('title')}
                  placeholder="Amazing Grace"
                  className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                {form.formState.errors.title && (
                  <p className="text-xs text-red-400 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Artist */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Artist / Author</label>
                <input
                  {...form.register('artist')}
                  placeholder="John Newton"
                  className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Lyrics editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs text-white/40 font-medium">Lyrics *</label>
                  <span className="text-[11px] text-white/20">
                    Use headers: VERSE 1, CHORUS, BRIDGE, TAG
                  </span>
                </div>
                <LyricsEditor
                  value={form.watch('lyrics')}
                  onChange={(val) => form.setValue('lyrics', val)}
                />
                {form.formState.errors.lyrics && (
                  <p className="text-xs text-red-400 mt-1">{form.formState.errors.lyrics.message}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">Album</label>
                  <input
                    {...form.register('album')}
                    className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 font-medium mb-1.5 block">CCLI Number</label>
                  <input
                    {...form.register('ccliNumber')}
                    className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Copyright</label>
                <input
                  {...form.register('copyright')}
                  placeholder="© 2024 Hillsong Publishing"
                  className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Category</label>
                <div className="relative">
                  <select
                    {...form.register('category')}
                    className="w-full h-9 rounded-md bg-white/[0.05] px-3 pr-8 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 appearance-none transition-colors"
                  >
                    <option value="">No category</option>
                    {SONG_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs text-white/40 font-medium mb-1.5 block">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(form.watch('tags') ?? []).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs text-white/60"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-white/30 hover:text-white/60">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                    placeholder="Add tag…"
                    className="flex-1 h-8 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/50 transition-colors"
                  />
                  <button
                    onClick={addTag}
                    className="flex h-8 items-center gap-1.5 rounded-md px-3 text-sm text-white/50 border border-white/[0.07] hover:bg-white/[0.05] hover:text-white/70 transition-colors"
                  >
                    <Tag className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
              </div>

              {/* Favorite toggle */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={cn(
                  'h-5 w-5 rounded border flex items-center justify-center transition-colors',
                  form.watch('favorite')
                    ? 'bg-amber-500/20 border-amber-500/50'
                    : 'border-white/[0.12] group-hover:border-white/25'
                )}>
                  {form.watch('favorite') && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                </div>
                <input type="checkbox" {...form.register('favorite')} className="sr-only" />
                <span className="text-sm text-white/60">Mark as favorite</span>
              </label>
            </div>
          )}

          {activeTab === 'slides' && (
            <div className="p-5">
              {previewSlides.length > 0 ? (
                <div className="space-y-4">
                  {/* Toggle between preview grid and reorder mode */}
                  <div className="flex gap-1 p-0.5 bg-white/[0.04] rounded-lg border border-white/[0.06] w-fit">
                    {(['preview', 'reorder'] as const).map((m) => (
                      <button key={m} onClick={() => setSlideViewMode(m)}
                        className={cn('h-7 rounded px-3 text-xs font-medium capitalize transition-colors',
                          slideViewMode === m ? 'bg-white/[0.08] text-white' : 'text-white/35 hover:text-white/60')}>
                        {m}
                      </button>
                    ))}
                  </div>
                  {slideViewMode === 'preview' ? (
                    <SlidePreviewGrid slides={previewSlides} />
                  ) : (
                    <SlideReorderPanel
                      slides={previewSlides}
                      onChange={(reordered) => setPreviewSlides(reordered)}
                      onReset={() => {
                        const parsed = reparseSong({ lyrics: form.getValues('lyrics'), title: form.getValues('title') } as any)
                        setPreviewSlides(parsed.slides)
                      }}
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-white/20 text-sm gap-2">
                  <p>No slides yet</p>
                  <p className="text-xs">Add lyrics to generate slides</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
