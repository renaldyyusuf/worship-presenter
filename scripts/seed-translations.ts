/**
 * WorshipPresenter — Multi-Translation Bible Seed
 * ─────────────────────────────────────────────────
 * Seeds additional Bible translations from bible-api.com.
 * Note: NIV is copyright Biblica — only KJV (public domain) is
 * auto-downloadable. For NIV/ESV you need a licensed API key.
 *
 * Free translations available via bible-api.com:
 *   kjv, web (World English Bible), bbe (Basic Bible in English),
 *   oeb-us, webbe, clementine, almeida, rccv
 *
 * Usage:
 *   npx tsx scripts/seed-translations.ts [--translation web] [--force]
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// bible-api.com translation codes → display names
const FREE_TRANSLATIONS: Record<string, string> = {
  kjv:       'KJV',
  web:       'WEB',
  bbe:       'BBE',
  'oeb-us':  'OEB',
  webbe:     'WEBBE',
}

const FORCE       = process.argv.includes('--force')
const TRANSLATION = process.argv.find((a, i) => process.argv[i - 1] === '--translation') ?? 'web'
const API_CODE    = Object.entries(FREE_TRANSLATIONS).find(([, v]) => v.toLowerCase() === TRANSLATION.toLowerCase())?.[0] ?? TRANSLATION
const DISPLAY     = FREE_TRANSLATIONS[API_CODE] ?? TRANSLATION.toUpperCase()
const BATCH_SIZE  = 500

const BOOKS = [
  {f:'Genesis',n:'Genesis'},{f:'Exodus',n:'Exodus'},{f:'Leviticus',n:'Leviticus'},
  {f:'Numbers',n:'Numbers'},{f:'Deuteronomy',n:'Deuteronomy'},{f:'Joshua',n:'Joshua'},
  {f:'Judges',n:'Judges'},{f:'Ruth',n:'Ruth'},{f:'1+Samuel',n:'1 Samuel'},
  {f:'2+Samuel',n:'2 Samuel'},{f:'1+Kings',n:'1 Kings'},{f:'2+Kings',n:'2 Kings'},
  {f:'1+Chronicles',n:'1 Chronicles'},{f:'2+Chronicles',n:'2 Chronicles'},{f:'Ezra',n:'Ezra'},
  {f:'Nehemiah',n:'Nehemiah'},{f:'Esther',n:'Esther'},{f:'Job',n:'Job'},
  {f:'Psalms',n:'Psalms'},{f:'Proverbs',n:'Proverbs'},{f:'Ecclesiastes',n:'Ecclesiastes'},
  {f:'Song+of+Solomon',n:'Song of Solomon'},{f:'Isaiah',n:'Isaiah'},{f:'Jeremiah',n:'Jeremiah'},
  {f:'Lamentations',n:'Lamentations'},{f:'Ezekiel',n:'Ezekiel'},{f:'Daniel',n:'Daniel'},
  {f:'Hosea',n:'Hosea'},{f:'Joel',n:'Joel'},{f:'Amos',n:'Amos'},
  {f:'Obadiah',n:'Obadiah'},{f:'Jonah',n:'Jonah'},{f:'Micah',n:'Micah'},
  {f:'Nahum',n:'Nahum'},{f:'Habakkuk',n:'Habakkuk'},{f:'Zephaniah',n:'Zephaniah'},
  {f:'Haggai',n:'Haggai'},{f:'Zechariah',n:'Zechariah'},{f:'Malachi',n:'Malachi'},
  {f:'Matthew',n:'Matthew'},{f:'Mark',n:'Mark'},{f:'Luke',n:'Luke'},
  {f:'John',n:'John'},{f:'Acts',n:'Acts'},{f:'Romans',n:'Romans'},
  {f:'1+Corinthians',n:'1 Corinthians'},{f:'2+Corinthians',n:'2 Corinthians'},{f:'Galatians',n:'Galatians'},
  {f:'Ephesians',n:'Ephesians'},{f:'Philippians',n:'Philippians'},{f:'Colossians',n:'Colossians'},
  {f:'1+Thessalonians',n:'1 Thessalonians'},{f:'2+Thessalonians',n:'2 Thessalonians'},{f:'1+Timothy',n:'1 Timothy'},
  {f:'2+Timothy',n:'2 Timothy'},{f:'Titus',n:'Titus'},{f:'Philemon',n:'Philemon'},
  {f:'Hebrews',n:'Hebrews'},{f:'James',n:'James'},{f:'1+Peter',n:'1 Peter'},
  {f:'2+Peter',n:'2 Peter'},{f:'1+John',n:'1 John'},{f:'2+John',n:'2 John'},
  {f:'3+John',n:'3 John'},{f:'Jude',n:'Jude'},{f:'Revelation',n:'Revelation'},
]

async function fetchChapter(book: string, chapter: number): Promise<{verse: number; text: string}[]> {
  const url = `https://bible-api.com/${book}+${chapter}?translation=${API_CODE}`
  try {
    const res  = await fetch(url, { signal: AbortSignal.timeout(12_000) })
    if (!res.ok) return []
    const json = await res.json() as { verses: { verse: number; text: string }[] }
    return (json.verses ?? []).map((v) => ({ verse: v.verse, text: v.text.trim().replace(/\n/g, ' ') }))
  } catch { return [] }
}

async function seed() {
  console.log(`\n✝  Seeding ${DISPLAY} Bible (${API_CODE}) into Supabase…\n`)

  const { count } = await supabase
    .from('bible_verses').select('*', { count: 'exact', head: true }).eq('translation', DISPLAY)

  if ((count ?? 0) > 0 && !FORCE) {
    console.log(`   ✓ Already seeded: ${count?.toLocaleString()} ${DISPLAY} verses. Use --force to re-seed.\n`)
    process.exit(0)
  }

  if (FORCE) {
    await supabase.from('bible_verses').delete().eq('translation', DISPLAY)
  }

  let total = 0
  const t0  = Date.now()

  for (let i = 0; i < BOOKS.length; i++) {
    const { f, n } = BOOKS[i]
    process.stdout.write(`[${String(i+1).padStart(2,'0')}/66] ${n.padEnd(22)}`)

    const rows: any[] = []

    // Fetch chapter by chapter (bible-api.com has per-chapter endpoint)
    // We estimate chapters based on known max (fetch until empty)
    for (let ch = 1; ch <= 150; ch++) {
      const verses = await fetchChapter(f, ch)
      if (verses.length === 0) break
      for (const v of verses) {
        rows.push({ translation: DISPLAY, book: n, book_num: i+1, chapter: ch, verse: v.verse, content: v.text })
      }
      await new Promise((r) => setTimeout(r, 150))
    }

    for (let b = 0; b < rows.length; b += BATCH_SIZE) {
      const { error } = await supabase.from('bible_verses')
        .upsert(rows.slice(b, b + BATCH_SIZE), { onConflict: 'translation,book_num,chapter,verse' })
      if (error) console.warn(`  ⚠ ${error.message}`)
    }

    total += rows.length
    console.log(`  ${String(rows.length).padStart(5)} verses`)
  }

  console.log(`\n✅  ${total.toLocaleString()} ${DISPLAY} verses seeded in ${((Date.now()-t0)/1000).toFixed(1)}s\n`)
}

seed().catch(e => { console.error('\n✗', e.message); process.exit(1) })
