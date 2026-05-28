'use client'

import { usePresentationStore } from '@/stores/presentation.store'
import type { Slide } from '@/types/presentation'

/**
 * usePresentation
 *
 * Convenience hook that exposes the most commonly used
 * presentation state + actions in one place.
 *
 * Use this in components that need presentation awareness
 * without importing and destructuring the full store.
 */
export function usePresentation() {
  const store = usePresentationStore()

  const isPlaying     = store.slideQueue.length > 0 && store.mode === 'normal'
  const isFirstSlide  = store.currentIndex === 0
  const isLastSlide   = store.currentIndex >= store.slideQueue.length - 1
  const hasPrev       = !isFirstSlide && store.slideQueue.length > 0
  const hasNext       = !isLastSlide  && store.slideQueue.length > 0
  const progress      = store.slideQueue.length > 1
    ? store.currentIndex / (store.slideQueue.length - 1)
    : 0

  // Section name of current slide
  const currentSection = store.currentSlide?.sectionLabel ?? null

  // All unique section labels in the queue
  const sections: { label: string; startIndex: number }[] = []
  store.slideQueue.forEach((slide, i) => {
    const label = slide.sectionLabel
    if (label && (sections.length === 0 || sections[sections.length - 1].label !== label)) {
      sections.push({ label, startIndex: i })
    }
  })

  // Jump to a section by label
  const goToSection = (label: string) => {
    const sec = sections.find((s) => s.label === label)
    if (sec) store.goTo(sec.startIndex)
  }

  return {
    // Raw store pass-through
    ...store,

    // Derived
    isPlaying,
    isFirstSlide,
    isLastSlide,
    hasPrev,
    hasNext,
    progress,
    currentSection,
    sections,

    // Enhanced actions
    goToSection,
  }
}
