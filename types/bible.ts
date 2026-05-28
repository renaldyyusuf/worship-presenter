// ─────────────────────────────────────────────
// Bible domain types
// ─────────────────────────────────────────────

import type { Slide } from './presentation'

export type BibleTranslation = 'KJV' | 'NIV' | 'ESV' | 'NASB' | 'NLT' | 'NKJV' | 'MSG' | 'AMP' | 'CSB'

export interface BibleVerse {
  id: string
  translation: BibleTranslation
  book: string
  bookNum: number
  chapter: number
  verse: number
  content: string
}

export interface BibleBook {
  num: number
  name: string
  abbrev: string
  testament: 'OT' | 'NT'
  chapters: number
}

// Parsed result from a reference query like "John 3:16" or "Psalm 23:1-6"
export interface BibleReference {
  book: string
  chapter: number
  verseStart: number
  verseEnd?: number
}

// A contiguous range of verses to present
export interface VerseRange {
  translation: BibleTranslation
  book: string
  chapter: number
  verseStart: number
  verseEnd: number
  verses: BibleVerse[]
  slides: Slide[]
}

export interface BibleSearchResult {
  type: 'reference' | 'keyword'
  query: string
  results: BibleVerse[]
  total: number
}

// Format: "John 3:16" | "John 3:16-18" | "Psalm 23"
export type BibleReferenceString = string

export const BIBLE_BOOKS: BibleBook[] = [
  { num: 1, name: 'Genesis', abbrev: 'Gen', testament: 'OT', chapters: 50 },
  { num: 2, name: 'Exodus', abbrev: 'Exod', testament: 'OT', chapters: 40 },
  { num: 3, name: 'Leviticus', abbrev: 'Lev', testament: 'OT', chapters: 27 },
  { num: 4, name: 'Numbers', abbrev: 'Num', testament: 'OT', chapters: 36 },
  { num: 5, name: 'Deuteronomy', abbrev: 'Deut', testament: 'OT', chapters: 34 },
  { num: 6, name: 'Joshua', abbrev: 'Josh', testament: 'OT', chapters: 24 },
  { num: 7, name: 'Judges', abbrev: 'Judg', testament: 'OT', chapters: 21 },
  { num: 8, name: 'Ruth', abbrev: 'Ruth', testament: 'OT', chapters: 4 },
  { num: 9, name: '1 Samuel', abbrev: '1Sam', testament: 'OT', chapters: 31 },
  { num: 10, name: '2 Samuel', abbrev: '2Sam', testament: 'OT', chapters: 24 },
  { num: 11, name: '1 Kings', abbrev: '1Kgs', testament: 'OT', chapters: 22 },
  { num: 12, name: '2 Kings', abbrev: '2Kgs', testament: 'OT', chapters: 25 },
  { num: 13, name: '1 Chronicles', abbrev: '1Chr', testament: 'OT', chapters: 29 },
  { num: 14, name: '2 Chronicles', abbrev: '2Chr', testament: 'OT', chapters: 36 },
  { num: 15, name: 'Ezra', abbrev: 'Ezra', testament: 'OT', chapters: 10 },
  { num: 16, name: 'Nehemiah', abbrev: 'Neh', testament: 'OT', chapters: 13 },
  { num: 17, name: 'Esther', abbrev: 'Esth', testament: 'OT', chapters: 10 },
  { num: 18, name: 'Job', abbrev: 'Job', testament: 'OT', chapters: 42 },
  { num: 19, name: 'Psalms', abbrev: 'Ps', testament: 'OT', chapters: 150 },
  { num: 20, name: 'Proverbs', abbrev: 'Prov', testament: 'OT', chapters: 31 },
  { num: 21, name: 'Ecclesiastes', abbrev: 'Eccl', testament: 'OT', chapters: 12 },
  { num: 22, name: 'Song of Solomon', abbrev: 'Song', testament: 'OT', chapters: 8 },
  { num: 23, name: 'Isaiah', abbrev: 'Isa', testament: 'OT', chapters: 66 },
  { num: 24, name: 'Jeremiah', abbrev: 'Jer', testament: 'OT', chapters: 52 },
  { num: 25, name: 'Lamentations', abbrev: 'Lam', testament: 'OT', chapters: 5 },
  { num: 26, name: 'Ezekiel', abbrev: 'Ezek', testament: 'OT', chapters: 48 },
  { num: 27, name: 'Daniel', abbrev: 'Dan', testament: 'OT', chapters: 12 },
  { num: 28, name: 'Hosea', abbrev: 'Hos', testament: 'OT', chapters: 14 },
  { num: 29, name: 'Joel', abbrev: 'Joel', testament: 'OT', chapters: 3 },
  { num: 30, name: 'Amos', abbrev: 'Amos', testament: 'OT', chapters: 9 },
  { num: 31, name: 'Obadiah', abbrev: 'Obad', testament: 'OT', chapters: 1 },
  { num: 32, name: 'Jonah', abbrev: 'Jonah', testament: 'OT', chapters: 4 },
  { num: 33, name: 'Micah', abbrev: 'Mic', testament: 'OT', chapters: 7 },
  { num: 34, name: 'Nahum', abbrev: 'Nah', testament: 'OT', chapters: 3 },
  { num: 35, name: 'Habakkuk', abbrev: 'Hab', testament: 'OT', chapters: 3 },
  { num: 36, name: 'Zephaniah', abbrev: 'Zeph', testament: 'OT', chapters: 3 },
  { num: 37, name: 'Haggai', abbrev: 'Hag', testament: 'OT', chapters: 2 },
  { num: 38, name: 'Zechariah', abbrev: 'Zech', testament: 'OT', chapters: 14 },
  { num: 39, name: 'Malachi', abbrev: 'Mal', testament: 'OT', chapters: 4 },
  { num: 40, name: 'Matthew', abbrev: 'Matt', testament: 'NT', chapters: 28 },
  { num: 41, name: 'Mark', abbrev: 'Mark', testament: 'NT', chapters: 16 },
  { num: 42, name: 'Luke', abbrev: 'Luke', testament: 'NT', chapters: 24 },
  { num: 43, name: 'John', abbrev: 'John', testament: 'NT', chapters: 21 },
  { num: 44, name: 'Acts', abbrev: 'Acts', testament: 'NT', chapters: 28 },
  { num: 45, name: 'Romans', abbrev: 'Rom', testament: 'NT', chapters: 16 },
  { num: 46, name: '1 Corinthians', abbrev: '1Cor', testament: 'NT', chapters: 16 },
  { num: 47, name: '2 Corinthians', abbrev: '2Cor', testament: 'NT', chapters: 13 },
  { num: 48, name: 'Galatians', abbrev: 'Gal', testament: 'NT', chapters: 6 },
  { num: 49, name: 'Ephesians', abbrev: 'Eph', testament: 'NT', chapters: 6 },
  { num: 50, name: 'Philippians', abbrev: 'Phil', testament: 'NT', chapters: 4 },
  { num: 51, name: 'Colossians', abbrev: 'Col', testament: 'NT', chapters: 4 },
  { num: 52, name: '1 Thessalonians', abbrev: '1Thess', testament: 'NT', chapters: 5 },
  { num: 53, name: '2 Thessalonians', abbrev: '2Thess', testament: 'NT', chapters: 3 },
  { num: 54, name: '1 Timothy', abbrev: '1Tim', testament: 'NT', chapters: 6 },
  { num: 55, name: '2 Timothy', abbrev: '2Tim', testament: 'NT', chapters: 4 },
  { num: 56, name: 'Titus', abbrev: 'Titus', testament: 'NT', chapters: 3 },
  { num: 57, name: 'Philemon', abbrev: 'Phlm', testament: 'NT', chapters: 1 },
  { num: 58, name: 'Hebrews', abbrev: 'Heb', testament: 'NT', chapters: 13 },
  { num: 59, name: 'James', abbrev: 'Jas', testament: 'NT', chapters: 5 },
  { num: 60, name: '1 Peter', abbrev: '1Pet', testament: 'NT', chapters: 5 },
  { num: 61, name: '2 Peter', abbrev: '2Pet', testament: 'NT', chapters: 3 },
  { num: 62, name: '1 John', abbrev: '1John', testament: 'NT', chapters: 5 },
  { num: 63, name: '2 John', abbrev: '2John', testament: 'NT', chapters: 1 },
  { num: 64, name: '3 John', abbrev: '3John', testament: 'NT', chapters: 1 },
  { num: 65, name: 'Jude', abbrev: 'Jude', testament: 'NT', chapters: 1 },
  { num: 66, name: 'Revelation', abbrev: 'Rev', testament: 'NT', chapters: 22 },
]

export const BIBLE_TRANSLATIONS: BibleTranslation[] = [
  'KJV', 'NIV', 'ESV', 'NASB', 'NLT', 'NKJV', 'MSG', 'AMP', 'CSB',
]
