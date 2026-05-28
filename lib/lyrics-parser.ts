import { v4 as uuid } from 'uuid'
import type { LyricsSection, SectionType } from '@/types/song'
import type { Slide } from '@/types/presentation'
import { SECTION_PATTERNS, SECTION_LABELS } from '@/types/song'

// ─────────────────────────────────────────────
// Parse raw lyrics text → LyricsSection[]
//
// Input format:
//   VERSE 1
//   Amazing grace how sweet the sound
//   That saved a wretch like me
//
//   CHORUS
//   My chains are gone I've been set free
// ─────────────────────────────────────────────

export function parseLyricsToSections(raw: string): LyricsSection[] {
  if (!raw.trim()) return []

  const lines = raw.split('\n')
  const sections: LyricsSection[] = []
  let currentType: SectionType = 'verse'
  let currentLabel = 'Verse 1'
  let currentLines: string[] = []
  let order = 0
  let verseCount = 0

  const detectSection = (line: string): { type: SectionType; label: string } | null => {
    const trimmed = line.trim()
    if (!trimmed) return null

    for (const [type, patterns] of Object.entries(SECTION_PATTERNS)) {
      for (const pattern of patterns) {
        const match = trimmed.match(pattern)
        if (match) {
          // Extract number if present: "Verse 2" → number = "2"
          const num = match[1] ? ` ${match[1]}` : ''
          return {
            type: type as SectionType,
            label: `${SECTION_LABELS[type as SectionType]}${num}`,
          }
        }
      }
    }
    return null
  }

  const pushSection = () => {
    const content = currentLines.join('\n').trim()
    if (content) {
      sections.push({
        id: uuid(),
        type: currentType,
        label: currentLabel,
        content,
        order: order++,
      })
    }
  }

  for (const line of lines) {
    const detected = detectSection(line)

    if (detected) {
      pushSection()
      currentLines = []
      currentType = detected.type
      currentLabel = detected.label
      if (detected.type === 'verse') verseCount++
    } else {
      currentLines.push(line)
    }
  }

  // Push the last section
  pushSection()

  // If no sections were detected (plain text, no headers), treat all as Verse 1
  if (sections.length === 0 && raw.trim()) {
    sections.push({
      id: uuid(),
      type: 'verse',
      label: 'Verse 1',
      content: raw.trim(),
      order: 0,
    })
  }

  return sections
}

// ─────────────────────────────────────────────
// Convert sections → Slide[]
//
// Each section becomes 1 or more slides.
// Long sections auto-split at MAX_LINES_PER_SLIDE.
// ─────────────────────────────────────────────

const MAX_LINES_PER_SLIDE = 4

export function sectionsToSlides(sections: LyricsSection[], songTitle: string): Slide[] {
  const slides: Slide[] = []

  for (const section of sections) {
    const lines = section.content
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    if (lines.length === 0) continue

    // Split into chunks of MAX_LINES_PER_SLIDE
    const chunks: string[][] = []
    for (let i = 0; i < lines.length; i += MAX_LINES_PER_SLIDE) {
      chunks.push(lines.slice(i, i + MAX_LINES_PER_SLIDE))
    }

    chunks.forEach((chunk, idx) => {
      slides.push({
        id: uuid(),
        type: 'lyrics',
        content: chunk.join('\n'),
        sectionLabel: section.label,
        subContent: idx === 0 ? section.label : `${section.label} (cont.)`,
        notes: `${songTitle} — ${section.label}`,
      })
    })
  }

  return slides
}

// ─────────────────────────────────────────────
// Utility: count lines in a section
// ─────────────────────────────────────────────
export function countLines(text: string): number {
  return text.split('\n').filter((l) => l.trim()).length
}

// ─────────────────────────────────────────────
// Utility: estimate how many slides a song will generate
// ─────────────────────────────────────────────
export function estimateSlideCount(lyrics: string): number {
  const sections = parseLyricsToSections(lyrics)
  return sections.reduce((total, section) => {
    const lineCount = countLines(section.content)
    return total + Math.ceil(lineCount / MAX_LINES_PER_SLIDE)
  }, 0)
}

// ─────────────────────────────────────────────
// Format section label for display
// ─────────────────────────────────────────────
export function formatSectionLabel(type: SectionType, index: number): string {
  const base = SECTION_LABELS[type]
  if (type === 'verse') return `${base} ${index + 1}`
  return base
}
