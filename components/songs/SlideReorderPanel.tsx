'use client'

import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, RotateCcw } from 'lucide-react'
import type { Slide } from '@/types/presentation'
import { cn } from '@/lib/utils'

interface SlideReorderPanelProps {
  slides:   Slide[]
  onChange: (slides: Slide[]) => void
  onReset?: () => void
}

/**
 * SlideReorderPanel
 *
 * Shown in the song editor "Slides" tab.
 * Lets operators drag-reorder individual slides within a song
 * (e.g. move the chorus to appear earlier).
 */
export function SlideReorderPanel({ slides, onChange, onReset }: SlideReorderPanelProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = slides.findIndex((s) => s.id === active.id)
    const newIdx = slides.findIndex((s) => s.id === over.id)
    onChange(arrayMove(slides, oldIdx, newIdx))
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-dashed border-white/[0.08] text-xs text-white/25">
        No slides — add lyrics first
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/35">Drag slides to reorder. Changes override section order.</p>
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 h-7 rounded px-2.5 text-xs text-white/35 hover:text-white/60 hover:bg-white/[0.06] border border-white/[0.07] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-1">
            {slides.map((slide, i) => (
              <SortableSlide key={slide.id} slide={slide} index={i} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

function SortableSlide({ slide, index }: { slide: Slide; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 transition-all',
        isDragging && 'opacity-50 shadow-xl border-indigo-500/30 bg-indigo-500/[0.06]'
      )}
    >
      <span className="text-[11px] text-white/20 font-mono tabular-nums min-w-[20px]">
        {index + 1}
      </span>

      <button
        {...attributes}
        {...listeners}
        className="text-white/15 hover:text-white/40 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex-1 min-w-0">
        {slide.sectionLabel && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-0.5">
            {slide.sectionLabel}
          </p>
        )}
        <p className="text-xs text-white/60 leading-snug line-clamp-2">
          {slide.content}
        </p>
      </div>
    </div>
  )
}
