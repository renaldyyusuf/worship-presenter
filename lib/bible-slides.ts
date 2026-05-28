import { v4 as uuid } from 'uuid'
import type { BibleVerse } from '@/types/bible'
import type { Slide } from '@/types/presentation'
import { formatVerseReference } from './bible-api'

// ─────────────────────────────────────────────
// Convert an array of BibleVerse → Slide[]
//
// Each verse becomes one slide.
// For very long verses, auto-wrap at MAX_CHARS_PER_SLIDE.
// ─────────────────────────────────────────────

const MAX_CHARS_PER_SLIDE = 220

export function versesToSlides(verses: BibleVerse[]): Slide[] {
  if (!verses.length) return []

  const slides: Slide[] = []

  for (const verse of verses) {
    const reference = formatVerseReference(verse)
    const text = verse.content.trim()

    if (text.length <= MAX_CHARS_PER_SLIDE) {
      slides.push({
        id: uuid(),
        type: 'bible',
        content: text,
        subContent: reference,
        sectionLabel: reference,
        notes: reference,
      })
    } else {
      // Split long verse into word-wrapped chunks
      const chunks = splitIntoChunks(text, MAX_CHARS_PER_SLIDE)
      chunks.forEach((chunk, idx) => {
        slides.push({
          id: uuid(),
          type: 'bible',
          content: chunk,
          subContent: idx === chunks.length - 1 ? reference : `${reference} (cont.)`,
          sectionLabel: reference,
          notes: reference,
        })
      })
    }
  }

  return slides
}

function splitIntoChunks(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const chunks: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      chunks.push(current.trim())
      current = word
    } else {
      current = candidate
    }
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// ─────────────────────────────────────────────
// Generate a title slide for a passage
// ─────────────────────────────────────────────
export function generatePassageTitleSlide(
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  translation: string
): Slide {
  const ref =
    verseStart === verseEnd
      ? `${book} ${chapter}:${verseStart}`
      : `${book} ${chapter}:${verseStart}–${verseEnd}`

  return {
    id: uuid(),
    type: 'bible',
    content: ref,
    subContent: translation,
    sectionLabel: 'Reference',
    notes: `${ref} (${translation})`,
  }
}
