/**
 * WorshipPresenter — Bible Seed Script
 * Downloads KJV (public domain) from github.com/aruljohn/Bible-kjv
 * Usage: npx tsx scripts/seed-bible.ts [--force]
 */
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FORCE       = process.argv.includes('--force')
const TRANSLATION = 'KJV'
const BATCH_SIZE  = 500
const BASE_URL    = 'https://raw.githubusercontent.com/aruljohn/Bible-kjv/master'

const BOOKS = [
  {f:'Genesis',n:'Genesis'},{f:'Exodus',n:'Exodus'},{f:'Leviticus',n:'Leviticus'},
  {f:'Numbers',n:'Numbers'},{f:'Deuteronomy',n:'Deuteronomy'},{f:'Joshua',n:'Joshua'},
  {f:'Judges',n:'Judges'},{f:'Ruth',n:'Ruth'},{f:'1Samuel',n:'1 Samuel'},
  {f:'2Samuel',n:'2 Samuel'},{f:'1Kings',n:'1 Kings'},{f:'2Kings',n:'2 Kings'},
  {f:'1Chronicles',n:'1 Chronicles'},{f:'2Chronicles',n:'2 Chronicles'},{f:'Ezra',n:'Ezra'},
  {f:'Nehemiah',n:'Nehemiah'},{f:'Esther',n:'Esther'},{f:'Job',n:'Job'},
  {f:'Psalms',n:'Psalms'},{f:'Proverbs',n:'Proverbs'},{f:'Ecclesiastes',n:'Ecclesiastes'},
  {f:'SongofSolomon',n:'Song of Solomon'},{f:'Isaiah',n:'Isaiah'},{f:'Jeremiah',n:'Jeremiah'},
  {f:'Lamentations',n:'Lamentations'},{f:'Ezekiel',n:'Ezekiel'},{f:'Daniel',n:'Daniel'},
  {f:'Hosea',n:'Hosea'},{f:'Joel',n:'Joel'},{f:'Amos',n:'Amos'},
  {f:'Obadiah',n:'Obadiah'},{f:'Jonah',n:'Jonah'},{f:'Micah',n:'Micah'},
  {f:'Nahum',n:'Nahum'},{f:'Habakkuk',n:'Habakkuk'},{f:'Zephaniah',n:'Zephaniah'},
  {f:'Haggai',n:'Haggai'},{f:'Zechariah',n:'Zechariah'},{f:'Malachi',n:'Malachi'},
  {f:'Matthew',n:'Matthew'},{f:'Mark',n:'Mark'},{f:'Luke',n:'Luke'},
  {f:'John',n:'John'},{f:'Acts',n:'Acts'},{f:'Romans',n:'Romans'},
  {f:'1Corinthians',n:'1 Corinthians'},{f:'2Corinthians',n:'2 Corinthians'},{f:'Galatians',n:'Galatians'},
  {f:'Ephesians',n:'Ephesians'},{f:'Philippians',n:'Philippians'},{f:'Colossians',n:'Colossians'},
  {f:'1Thessalonians',n:'1 Thessalonians'},{f:'2Thessalonians',n:'2 Thessalonians'},{f:'1Timothy',n:'1 Timothy'},
  {f:'2Timothy',n:'2 Timothy'},{f:'Titus',n:'Titus'},{f:'Philemon',n:'Philemon'},
  {f:'Hebrews',n:'Hebrews'},{f:'James',n:'James'},{f:'1Peter',n:'1 Peter'},
  {f:'2Peter',n:'2 Peter'},{f:'1John',n:'1 John'},{f:'2John',n:'2 John'},
  {f:'3John',n:'3 John'},{f:'Jude',n:'Jude'},{f:'Revelation',n:'Revelation'},
]

async function seed() {
  console.log(`\n✝  Seeding ${TRANSLATION} Bible into Supabase…\n`)

  const { count } = await supabase
    .from('bible_verses').select('*', { count: 'exact', head: true }).eq('translation', TRANSLATION)

  if ((count ?? 0) > 0 && !FORCE) {
    console.log(`   ✓ Already seeded: ${count?.toLocaleString()} verses. Use --force to re-seed.\n`)
    process.exit(0)
  }

  if (FORCE) {
    await supabase.from('bible_verses').delete().eq('translation', TRANSLATION)
  }

  let total = 0
  const t0  = Date.now()

  for (let i = 0; i < BOOKS.length; i++) {
    const { f, n } = BOOKS[i]
    process.stdout.write(`[${String(i+1).padStart(2,'0')}/66] ${n.padEnd(22)}`)

    let json: any
    try {
      const res = await fetch(`${BASE_URL}/${f}.json`, { signal: AbortSignal.timeout(15000) })
      if (!res.ok) { console.log('  SKIP'); continue }
      json = await res.json()
    } catch { console.log('  SKIP'); continue }

    const rows: any[] = []
    for (const [ch, verses] of Object.entries(json as Record<string, Record<string, string>>)) {
      const chapter = parseInt(ch, 10)
      if (isNaN(chapter)) continue
      for (const [v, text] of Object.entries(verses)) {
        const verse = parseInt(v, 10)
        if (isNaN(verse)) continue
        rows.push({ translation: TRANSLATION, book: n, book_num: i+1, chapter, verse, content: String(text).trim() })
      }
    }

    for (let b = 0; b < rows.length; b += BATCH_SIZE) {
      const { error } = await supabase.from('bible_verses')
        .upsert(rows.slice(b, b + BATCH_SIZE), { onConflict: 'translation,book_num,chapter,verse' })
      if (error) throw error
    }

    total += rows.length
    console.log(`  ${String(rows.length).padStart(5)} verses`)
  }

  console.log(`\n✅  ${total.toLocaleString()} verses seeded in ${((Date.now()-t0)/1000).toFixed(1)}s\n`)
}

seed().catch(e => { console.error('\n✗', e.message); process.exit(1) })
