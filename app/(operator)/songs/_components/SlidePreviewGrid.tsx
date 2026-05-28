'use client'

import { usePresentationStore } from '@/stores/presentation.store'
import type { Slide } from '@/types/presentation'
import { cn } from '@/lib/utils'
import { Play } from 'lucide-react'

interface SlidePreviewGridProps {
  slides: Slide[]
  onSelect?: (index: number) => void
}

export function SlidePreviewGrid({ slides, onSelect }: SlidePreviewGridProps) {
  const { currentSlide, goTo } = usePresentationStore()

  const handleClick = (index: number) => {
    goTo(index)
    onSelect?.(index)
  }

  return (
    <div className="space-y-4">
      {/* Group by section label */}
      {groupBySection(slides).map(({ label, items }) => (
        <div key={label}>
          <p className="text-[11px] font-medium text-white/30 uppercase tracking-wider mb-2">{label}</p>
          <div className="grid grid-cols-3 gap-2">
            {items.map(({ slide, globalIndex }) => {
              const isCurrent = currentSlide?.id === slide.id
              return (
                <button
                  key={slide.id}
                  onClick={() => handleClick(globalIndex)}
                  className={cn(
                    'group relative rounded-lg border overflow-hidden text-left transition-all',
                    'aspect-video flex flex-col items-center justify-center p-2',
                    isCurrent
                      ? 'border-indigo-500/70 bg-indigo-500/10 ring-1 ring-indigo-500/40'
                      : 'border-white/[0.07] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]'
                  )}
                >
                  {/* Slide text */}
                  <p className={cn(
                    'text-center text-[9px] leading-[1.4] line-clamp-4',
                    isCurrent ? 'text-white/90' : 'text-white/50'
                  )}>
                    {slide.content}
                  </p>

                  {/* Live indicator */}
                  {isCurrent && (
                    <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}

                  {/* Present on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity rounded-lg">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function groupBySection(slides: Slide[]) {
  const groups: { label: string; items: { slide: Slide; globalIndex: number }[] }[] = []
  let current: { label: string; items: { slide: Slide; globalIndex: number }[] } | null = null

  slides.forEach((slide, i) => {
    const label = slide.sectionLabel ?? 'Slides'
    if (!current || current.label !== label) {
      current = { label, items: [] }
      groups.push(current)
    }
    current.items.push({ slide, globalIndex: i })
  })

  return groups
}
