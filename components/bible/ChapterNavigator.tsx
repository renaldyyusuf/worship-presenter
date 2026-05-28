'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBibleStore } from '@/stores/bible.store'
import { BIBLE_BOOKS } from '@/types/bible'

/**
 * ChapterNavigator
 * Shown below Bible search results when viewing a reference.
 * Lets the operator quickly flip to the previous or next chapter.
 */
export function ChapterNavigator() {
  const { lastReference, translation, searchVerses } = useBibleStore()

  if (!lastReference) return null

  const book      = BIBLE_BOOKS.find((b) => b.name === lastReference.book)
  if (!book) return null

  const chapter   = lastReference.chapter
  const hasPrev   = chapter > 1
  const hasNext   = chapter < book.chapters

  const go = (ch: number) => {
    searchVerses(`${lastReference.book} ${ch}`, translation)
  }

  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.06] bg-white/[0.01]">
      <button
        onClick={() => go(chapter - 1)}
        disabled={!hasPrev}
        className="flex items-center gap-1.5 h-7 rounded px-2.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Ch {chapter - 1}
      </button>

      <span className="text-xs font-medium text-white/40">
        {lastReference.book} {chapter} / {book.chapters}
      </span>

      <button
        onClick={() => go(chapter + 1)}
        disabled={!hasNext}
        className="flex items-center gap-1.5 h-7 rounded px-2.5 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.06] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        Ch {chapter + 1}
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
