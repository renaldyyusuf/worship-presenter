'use client'

import { useEffect, useState } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy,
  useSortable, arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  ListOrdered, Plus, GripVertical, Trash2, Play, Music2,
  BookOpen, Video, Image as ImageIcon, Megaphone, Square, CalendarDays,
  ChevronRight, Clock, Printer, Download, Copy,
} from 'lucide-react'
import { printHtml, downloadFile, exportServicePlanText } from '@/lib/export'
import { useServiceStore } from '@/stores/service.store'
import { useSongsStore } from '@/stores/songs.store'
import type { ServiceItem, ServiceItemType } from '@/types'
import { cn, formatServiceDate } from '@/lib/utils'

const TYPE_META: Record<ServiceItemType, { icon: React.ElementType; color: string; label: string }> = {
  song:         { icon: Music2,      color: 'text-indigo-400',  label: 'Song' },
  bible:        { icon: BookOpen,    color: 'text-blue-400',    label: 'Bible' },
  video:        { icon: Video,       color: 'text-purple-400',  label: 'Video' },
  image:        { icon: ImageIcon,   color: 'text-pink-400',    label: 'Image' },
  announcement: { icon: Megaphone,   color: 'text-amber-400',   label: 'Announcement' },
  blank:        { icon: Square,      color: 'text-white/30',    label: 'Blank' },
}

export default function ServicePage() {
  const { plans, activePlan, fetchPlans, setActivePlan, createPlan, duplicatePlan } = useServiceStore()
  const [showNewPlan, setShowNewPlan] = useState(false)

  useEffect(() => { fetchPlans() }, [fetchPlans])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar — plan list */}
      <div className="w-[240px] flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden bg-[#0d0d0d]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-white/60">Service Plans</span>
          <button
            onClick={() => setShowNewPlan(true)}
            className="h-6 w-6 flex items-center justify-center rounded text-white/40 hover:bg-white/[0.07] hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {showNewPlan && (
          <NewPlanForm onDone={() => setShowNewPlan(false)} />
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {plans.length === 0 ? (
            <p className="text-xs text-white/25 text-center py-8 px-4">
              No service plans yet. Create one to get started.
            </p>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'group relative rounded-md transition-colors border',
                  activePlan?.id === plan.id
                    ? 'bg-indigo-500/10 border-indigo-500/25'
                    : 'border-transparent hover:bg-white/[0.04]'
                )}
              >
                <button
                  onClick={() => setActivePlan(plan)}
                  className="w-full text-left px-3 py-2.5"
                >
                  <p className={cn('text-xs font-medium truncate', activePlan?.id === plan.id ? 'text-white' : 'text-white/60')}>
                    {plan.title}
                  </p>
                  <p className="text-[11px] text-white/30 mt-0.5 flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    {formatServiceDate(plan.serviceDate)}
                  </p>
                  <p className="text-[11px] text-white/25 mt-0.5">
                    {plan.items?.length ?? 0} items
                  </p>
                </button>
                {/* Plan actions on hover */}
                <div className="absolute top-1.5 right-1.5 hidden group-hover:flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); duplicatePlan(plan.id) }}
                    title="Duplicate plan"
                    className="h-6 w-6 flex items-center justify-center rounded text-white/30 hover:bg-white/[0.10] hover:text-white/70 transition-colors"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main — plan editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activePlan ? (
          <ServicePlanEditor />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
              <ListOrdered className="h-7 w-7 text-white/15" />
            </div>
            <div>
              <p className="text-sm text-white/30 font-medium">No plan selected</p>
              <p className="text-xs text-white/20 mt-1">Select a plan from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Service plan editor with drag-drop
// ─────────────────────────────────────────────
function ServicePlanEditor() {
  const { activePlan, activeItemIndex, reorderItems, removeItem, goToItem, addItem } = useServiceStore()
  const [showAddItem, setShowAddItem] = useState(false)
  const items = activePlan?.items ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((i) => i.id === active.id)
    const newIdx = items.findIndex((i) => i.id === over.id)
    reorderItems(arrayMove(items, oldIdx, newIdx))
  }

  if (!activePlan) return null

  return (
    <>
      {/* Plan header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0d]">
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{activePlan.title}</h2>
          <p className="text-xs text-white/30 flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {formatServiceDate(activePlan.serviceDate)}
            <span className="mx-1 text-white/15">·</span>
            {items.length} items
          </p>
        </div>
        <button
          onClick={async () => {
            const res = await fetch(`/api/service/${activePlan.id}/export`)
            const html = await res.text()
            printHtml(html)
          }}
          className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.07] px-3 text-sm text-white/45 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
        >
          <Printer className="h-3.5 w-3.5" />Print
        </button>
        <button
          onClick={() => {
            const text = exportServicePlanText(activePlan)
            downloadFile(text, `${activePlan.title}.txt`, 'text/plain')
          }}
          className="flex h-8 items-center gap-1.5 rounded-md border border-white/[0.07] px-3 text-sm text-white/45 hover:text-white/70 hover:bg-white/[0.05] transition-colors"
        >
          <Download className="h-3.5 w-3.5" />Export
        </button>
        <button
          onClick={() => setShowAddItem(true)}
          className="flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />Add Item
        </button>
      </div>

      {/* Drag-drop list */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <p className="text-sm text-white/25">No items in this plan</p>
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-1.5 h-8 rounded-md border border-white/[0.08] px-4 text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add first item
            </button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5 max-w-2xl">
                {items.map((item, index) => (
                  <SortableServiceItem
                    key={item.id}
                    item={item}
                    index={index}
                    isActive={index === activeItemIndex}
                    onPlay={() => goToItem(index)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
    </>
  )
}

// ─────────────────────────────────────────────
// Sortable service item row
// ─────────────────────────────────────────────
function SortableServiceItem({
  item, index, isActive, onPlay, onRemove,
}: {
  item: ServiceItem; index: number; isActive: boolean
  onPlay: () => void; onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const meta = TYPE_META[item.type]
  const Icon = meta.icon

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-3 border transition-colors',
        isDragging && 'opacity-50 shadow-2xl',
        isActive
          ? 'border-indigo-500/40 bg-indigo-500/[0.08]'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04]'
      )}
    >
      {/* Order number */}
      <span className="text-[11px] font-mono text-white/20 min-w-[18px] text-center">{index + 1}</span>

      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="text-white/15 hover:text-white/40 cursor-grab active:cursor-grabbing transition-colors touch-none"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Type icon */}
      <div className={cn('flex-shrink-0', meta.color)}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/85 truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={cn('text-[11px] font-medium', meta.color)}>{meta.label}</span>
          {item.subtitle && (
            <span className="text-[11px] text-white/30 truncate">{item.subtitle}</span>
          )}
          {item.durationMin && (
            <span className="text-[11px] text-white/25 flex items-center gap-0.5 ml-auto flex-shrink-0">
              <Clock className="h-3 w-3" />
              {item.durationMin}m
            </span>
          )}
        </div>
        {item.notes && (
          <p className="text-[11px] text-white/25 mt-0.5 truncate italic">{item.notes}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={onPlay}
          title="Go to this item"
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded transition-colors',
            isActive
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'text-white/30 hover:bg-white/[0.07] hover:text-white'
          )}
        >
          {isActive ? <ChevronRight className="h-4 w-4" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={onRemove}
          className="flex h-7 w-7 items-center justify-center rounded text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// New plan form (inline)
// ─────────────────────────────────────────────
function NewPlanForm({ onDone }: { onDone: () => void }) {
  const { createPlan, setActivePlan } = useServiceStore()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  const handleCreate = async () => {
    if (!title.trim()) return
    const plan = await createPlan(title.trim(), date)
    if (plan) { setActivePlan(plan); onDone() }
  }

  return (
    <div className="p-3 border-b border-white/[0.06] bg-white/[0.02] space-y-2">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        placeholder="Sunday Service"
        autoFocus
        className="w-full h-8 rounded bg-white/[0.06] px-3 text-xs text-white placeholder:text-white/30 border border-white/[0.08] focus:outline-none focus:border-indigo-500/40"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-full h-8 rounded bg-white/[0.06] px-3 text-xs text-white border border-white/[0.08] focus:outline-none focus:border-indigo-500/40"
      />
      <div className="flex gap-1.5">
        <button onClick={handleCreate} className="flex-1 h-7 rounded bg-indigo-600 text-xs text-white hover:bg-indigo-500 transition-colors">
          Create
        </button>
        <button onClick={onDone} className="flex-1 h-7 rounded border border-white/[0.07] text-xs text-white/40 hover:text-white/60 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Add item modal
// ─────────────────────────────────────────────
function AddItemModal({ onClose }: { onClose: () => void }) {
  const { addItem } = useServiceStore()
  const { songs } = useSongsStore()
  const [type, setType] = useState<ServiceItemType>('song')
  const [selectedSong, setSelectedSong] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [notes, setNotes] = useState('')

  const handleAdd = async () => {
    const song = songs.find((s) => s.id === selectedSong)
    await addItem({
      type,
      refId: type === 'song' ? selectedSong || undefined : undefined,
      title: type === 'song' && song ? song.title : customTitle || type,
      notes: notes || undefined,
    })
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[380px] rounded-xl border border-white/[0.09] bg-[#111] shadow-2xl p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Add Service Item</h3>

        {/* Type selector */}
        <div className="grid grid-cols-3 gap-1.5 mb-4">
          {(Object.entries(TYPE_META) as [ServiceItemType, typeof TYPE_META[ServiceItemType]][]).map(([t, meta]) => {
            const Icon = meta.icon
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg py-2.5 border text-[11px] font-medium transition-colors',
                  type === t
                    ? `border-indigo-500/40 bg-indigo-500/10 ${meta.color}`
                    : 'border-white/[0.06] text-white/40 hover:border-white/[0.12] hover:text-white/60'
                )}
              >
                <Icon className="h-4 w-4" />
                {meta.label}
              </button>
            )
          })}
        </div>

        {/* Song picker */}
        {type === 'song' && (
          <div className="mb-3">
            <label className="text-xs text-white/40 mb-1.5 block">Select Song</label>
            <select
              value={selectedSong}
              onChange={(e) => setSelectedSong(e.target.value)}
              className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
            >
              <option value="">Choose a song…</option>
              {songs.map((s) => (
                <option key={s.id} value={s.id}>{s.title}{s.artist ? ` — ${s.artist}` : ''}</option>
              ))}
            </select>
          </div>
        )}

        {/* Custom title for non-song items */}
        {type !== 'song' && (
          <div className="mb-3">
            <label className="text-xs text-white/40 mb-1.5 block">Title</label>
            <input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder={`${TYPE_META[type].label} title…`}
              className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-4">
          <label className="text-xs text-white/40 mb-1.5 block">Notes (optional)</label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes for this item…"
            className="w-full h-9 rounded-md bg-white/[0.05] px-3 text-sm text-white placeholder:text-white/25 border border-white/[0.07] focus:outline-none focus:border-indigo-500/40"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAdd}
            className="flex-1 h-9 rounded-md bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            Add
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-9 rounded-md border border-white/[0.07] text-sm text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}
