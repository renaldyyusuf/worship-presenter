'use client'

import { useState } from 'react'
import { ListOrdered, Check, ChevronDown } from 'lucide-react'
import { useServiceStore } from '@/stores/service.store'
import { useBibleStore } from '@/stores/bible.store'
import { toast } from '@/components/shared/Toaster'
import { cn } from '@/lib/utils'

export function AddToServiceButton() {
  const { activePlan, plans, setActivePlan, addItem } = useServiceStore()
  const { selectedVerses, lastReference }              = useBibleStore()
  const [isAdding, setIsAdding]   = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const [added, setAdded]         = useState(false)

  if (selectedVerses.length === 0) return null

  const handleAdd = async (planId?: string) => {
    // Switch plan if needed
    if (planId && planId !== activePlan?.id) {
      const plan = plans.find((p) => p.id === planId)
      if (plan) setActivePlan(plan)
    }

    if (!activePlan && !planId) {
      toast.error('No service plan selected', 'Open the Service page and create or select a plan first.')
      return
    }

    setIsAdding(true)
    setShowPicker(false)

    // Build a title from the first verse reference
    const first  = selectedVerses[0]
    const last   = selectedVerses[selectedVerses.length - 1]
    const isSameChapter = first.book === last.book && first.chapter === last.chapter
    const title  = isSameChapter
      ? `${first.book} ${first.chapter}:${first.verse}–${last.verse}`
      : `${first.book} ${first.chapter}:${first.verse}`

    // Serialize slides from bible store
    const { generatedSlides } = useBibleStore.getState()

    await addItem({
      type:    'bible',
      title,
      subtitle: first.translation,
      slides:  generatedSlides as any,
    })

    setIsAdding(false)
    setAdded(true)
    toast.success('Added to service', title)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="relative">
      {/* Split button: quick-add + plan picker */}
      <div className="flex items-center gap-0">
        <button
          onClick={() => handleAdd()}
          disabled={isAdding}
          className={cn(
            'flex h-8 items-center gap-1.5 rounded-l-md px-3 text-sm font-medium transition-colors border-r border-white/10',
            added
              ? 'bg-emerald-600 text-white'
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          )}
        >
          {added ? (
            <><Check className="h-3.5 w-3.5" />Added!</>
          ) : (
            <><ListOrdered className="h-3.5 w-3.5" />Add to Service</>
          )}
        </button>
        {plans.length > 1 && (
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex h-8 items-center px-2 rounded-r-md bg-indigo-600 text-white hover:bg-indigo-500 transition-colors"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Plan picker dropdown */}
      {showPicker && plans.length > 1 && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setShowPicker(false)} />
          <div className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border border-white/[0.09] bg-[#111] shadow-xl overflow-hidden">
            <p className="px-3 py-2 text-[11px] font-semibold text-white/30 uppercase tracking-wider border-b border-white/[0.06]">
              Add to plan
            </p>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleAdd(plan.id)}
                className={cn(
                  'w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-white/[0.05]',
                  activePlan?.id === plan.id ? 'text-indigo-400' : 'text-white/70'
                )}
              >
                <p className="font-medium">{plan.title}</p>
                <p className="text-xs text-white/30 mt-0.5">{plan.serviceDate}</p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
