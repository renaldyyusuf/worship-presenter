'use client'

import { useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import type { LyricsSection, SectionType } from '@/types/song'
import { SECTION_LABELS } from '@/types/song'
import { cn } from '@/lib/utils'

interface SectionEditorProps {
  sections: LyricsSection[]
  onChange: (sections: LyricsSection[]) => void
}

const SECTION_COLORS: Record<SectionType, string> = {
  verse:       'border-l-blue-500/60',
  chorus:      'border-l-indigo-500/60',
  bridge:      'border-l-purple-500/60',
  tag:         'border-l-pink-500/60',
  intro:       'border-l-emerald-500/60',
  outro:       'border-l-emerald-500/60',
  'pre-chorus':'border-l-violet-500/60',
  instrumental:'border-l-amber-500/60',
}

export function SectionEditor({ sections, onChange }: SectionEditorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    onChange(arrayMove(sections, oldIdx, newIdx).map((s, i) => ({ ...s, order: i })))
  }

  const updateSection = (id: string, patch: Partial<LyricsSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id))
  }

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-white/[0.08] text-xs text-white/25">
        No sections parsed yet — add lyrics in the Lyrics tab
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1.5">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              isExpanded={expandedId === section.id}
              onToggle={() => setExpandedId(expandedId === section.id ? null : section.id)}
              onUpdate={(patch) => updateSection(section.id, patch)}
              onRemove={() => removeSection(section.id)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ─────────────────────────────────────────────
// Individual sortable section
// ─────────────────────────────────────────────
function SortableSection({
  section, isExpanded, onToggle, onUpdate, onRemove,
}: {
  section: LyricsSection
  isExpanded: boolean
  onToggle: () => void
  onUpdate: (patch: Partial<LyricsSection>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const colorClass = SECTION_COLORS[section.type] ?? 'border-l-white/20'
  const lineCount  = section.content.split('\n').filter(Boolean).length
  const slideCount = Math.ceil(lineCount / 4)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border border-white/[0.07] border-l-2 bg-white/[0.02] overflow-hidden transition-all',
        colorClass,
        isDragging && 'opacity-60 shadow-xl'
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          {...attributes}
          {...listeners}
          className="text-white/15 hover:text-white/40 cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Type selector */}
        <select
          value={section.type}
          onChange={(e) => {
            const newType = e.target.value as SectionType
            onUpdate({ type: newType, label: SECTION_LABELS[newType] })
          }}
          onClick={(e) => e.stopPropagation()}
          className="h-6 rounded bg-white/[0.05] px-1.5 text-xs text-white/70 border border-white/[0.07] focus:outline-none focus:border-indigo-500/40 appearance-none cursor-pointer"
        >
          {(Object.entries(SECTION_LABELS) as [SectionType, string][]).map(([type, label]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>

        {/* Custom label */}
        <input
          value={section.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 h-6 rounded bg-transparent px-1.5 text-xs text-white/60 border border-transparent hover:border-white/[0.07] focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] min-w-0 transition-colors"
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-white/25 tabular-nums">
            {lineCount}L · {slideCount}sl
          </span>
          <button
            onClick={onRemove}
            className="h-5 w-5 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
          <button onClick={onToggle} className="h-5 w-5 flex items-center justify-center rounded text-white/25 hover:text-white/60 transition-colors">
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded content editor */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-white/[0.05]">
          <textarea
            value={section.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            rows={Math.max(3, section.content.split('\n').length + 1)}
            className="w-full mt-2 rounded bg-white/[0.03] border border-white/[0.06] px-3 py-2 text-xs font-mono text-white/70 focus:outline-none focus:border-indigo-500/40 resize-none"
            placeholder="Lyrics for this section…"
          />
        </div>
      )}
    </div>
  )
}
