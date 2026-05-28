// ─────────────────────────────────────────────
// Song domain types
// ─────────────────────────────────────────────

import type { Slide, SlideTheme } from './presentation'

export type SectionType = 'verse' | 'chorus' | 'bridge' | 'tag' | 'intro' | 'outro' | 'pre-chorus' | 'instrumental'

export interface LyricsSection {
  id: string
  type: SectionType
  label: string       // e.g. "Verse 1", "Chorus", "Bridge"
  content: string     // raw text lines
  order: number
}

export interface Song {
  id: string
  title: string
  artist?: string
  album?: string
  year?: number
  ccliNumber?: string
  copyright?: string
  lyrics: string            // raw full lyrics text
  sections: LyricsSection[] // parsed sections
  slides: Slide[]           // generated presentation slides
  tags: string[]
  category?: string
  favorite: boolean
  themeId?: string
  themeOverride?: Partial<SlideTheme>
  createdAt: string
  updatedAt: string
}

export interface SongFormValues {
  title: string
  artist?: string
  album?: string
  year?: number
  ccliNumber?: string
  copyright?: string
  lyrics: string
  tags: string[]
  category?: string
  favorite?: boolean
  themeId?: string
}

// Section header patterns for the lyrics parser
export const SECTION_PATTERNS: Record<SectionType, RegExp[]> = {
  verse: [
    /^verse\s*(\d+)?/i,
    /^v(\d+)/i,
    /^stanza\s*(\d+)?/i,
  ],
  chorus: [
    /^chorus/i,
    /^refrain/i,
    /^c\b/i,
  ],
  bridge: [
    /^bridge/i,
    /^b\b/i,
  ],
  tag: [
    /^tag/i,
    /^outro tag/i,
  ],
  intro: [/^intro/i],
  outro: [/^outro/i],
  'pre-chorus': [/^pre.?chorus/i, /^pre\b/i],
  instrumental: [/^instrumental/i, /^interlude/i],
}

export const SECTION_LABELS: Record<SectionType, string> = {
  verse: 'Verse',
  chorus: 'Chorus',
  bridge: 'Bridge',
  tag: 'Tag',
  intro: 'Intro',
  outro: 'Outro',
  'pre-chorus': 'Pre-Chorus',
  instrumental: 'Instrumental',
}

export const SONG_CATEGORIES = [
  'Worship',
  'Hymn',
  'Contemporary',
  'Gospel',
  'Christmas',
  'Easter',
  'Communion',
  'Offering',
  'Closing',
  'Special',
] as const

export type SongCategory = (typeof SONG_CATEGORIES)[number]
