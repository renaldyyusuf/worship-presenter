// ─────────────────────────────────────────────
// Bible reference parser
// ─────────────────────────────────────────────
import { v4 as uuid } from 'uuid'
import type { BibleReference, BibleVerse } from '@/types/bible'
import type { Slide } from '@/types/presentation'
import { BIBLE_BOOKS } from '@/types/bible'

// Patterns to match:
//   "John 3:16"
//   "John 3:16-18"
//   "1 John 3:16"
//   "Psalm 23"
//   "Psalm 23:1-6"
const REFERENCE_REGEX =
  /^(\d?\s?[A-Za-z]+(?:\s[A-Za-z]+)?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/

export function parseBibleReference(query: string): BibleReference | null {
  const trimmed = query.trim()
  const match = trimmed.match(REFERENCE_REGEX)
  if (!match) return null

  const [, bookRaw, chapterStr, verseStartStr, verseEndStr] = match
  const bookName = resolveBookName(bookRaw.trim())
  if (!bookName) return null

  return {
    book: bookName,
    chapter: parseInt(chapterStr, 10),
    verseStart: verseStartStr ? parseInt(verseStartStr, 10) : 1,
    verseEnd: verseEndStr ? parseInt(verseEndStr, 10) : undefined,
  }
}

// Resolve common abbreviations and alternate names to canonical book name
function resolveBookName(input: string): string | null {
  const normalized = input.toLowerCase().replace(/\s+/g, '')

  const aliases: Record<string, string> = {
    // OT
    gen: 'Genesis', exod: 'Exodus', exo: 'Exodus', lev: 'Leviticus',
    num: 'Numbers', deut: 'Deuteronomy', deu: 'Deuteronomy',
    josh: 'Joshua', judg: 'Judges', jdg: 'Judges',
    ruth: 'Ruth', '1sam': '1 Samuel', '2sam': '2 Samuel',
    '1kgs': '1 Kings', '2kgs': '2 Kings', '1chr': '1 Chronicles',
    '2chr': '2 Chronicles', ezra: 'Ezra', neh: 'Nehemiah',
    esth: 'Esther', est: 'Esther', job: 'Job',
    ps: 'Psalms', psa: 'Psalms', psalm: 'Psalms', psalms: 'Psalms',
    prov: 'Proverbs', pro: 'Proverbs', eccl: 'Ecclesiastes',
    ecc: 'Ecclesiastes', song: 'Song of Solomon', sos: 'Song of Solomon',
    isa: 'Isaiah', jer: 'Jeremiah', lam: 'Lamentations',
    ezek: 'Ezekiel', eze: 'Ezekiel', dan: 'Daniel',
    hos: 'Hosea', joel: 'Joel', amos: 'Amos', obad: 'Obadiah',
    jonah: 'Jonah', jon: 'Jonah', mic: 'Micah', nah: 'Nahum',
    hab: 'Habakkuk', zeph: 'Zephaniah', hag: 'Haggai',
    zech: 'Zechariah', zec: 'Zechariah', mal: 'Malachi',
    // NT
    matt: 'Matthew', mat: 'Matthew', matthew: 'Matthew',
    mark: 'Mark', luke: 'Luke', john: 'John',
    acts: 'Acts', rom: 'Romans', romans: 'Romans',
    '1cor': '1 Corinthians', '2cor': '2 Corinthians',
    gal: 'Galatians', eph: 'Ephesians', phil: 'Philippians',
    col: 'Colossians', '1thess': '1 Thessalonians', '2thess': '2 Thessalonians',
    '1tim': '1 Timothy', '2tim': '2 Timothy', titus: 'Titus',
    phlm: 'Philemon', heb: 'Hebrews', jas: 'James',
    '1pet': '1 Peter', '2pet': '2 Peter',
    '1john': '1 John', '2john': '2 John', '3john': '3 John',
    jude: 'Jude', rev: 'Revelation', revelations: 'Revelation',
  }

  if (aliases[normalized]) return aliases[normalized]

  // Try direct match against book names
  const book = BIBLE_BOOKS.find(
    (b) => b.name.toLowerCase().replace(/\s+/g, '') === normalized ||
           b.abbrev.toLowerCase() === normalized
  )
  return book?.name ?? null
}

// ─────────────────────────────────────────────
// Format a reference for display: "John 3:16-18"
// ─────────────────────────────────────────────
export function formatReference(ref: BibleReference): string {
  let result = `${ref.book} ${ref.chapter}`
  if (ref.verseStart > 1 || ref.verseEnd) {
    result += `:${ref.verseStart}`
    if (ref.verseEnd && ref.verseEnd !== ref.verseStart) {
      result += `-${ref.verseEnd}`
    }
  }
  return result
}

// ─────────────────────────────────────────────
// Format verse reference for slide display
// ─────────────────────────────────────────────
export function formatVerseReference(verse: BibleVerse): string {
  return `${verse.book} ${verse.chapter}:${verse.verse} (${verse.translation})`
}
