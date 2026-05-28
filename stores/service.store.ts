import { create } from 'zustand'
import type { ServicePlan, ServiceItem, ServiceItemFormValues } from '@/types'
import { getSocket } from '@/lib/socket'
import { useSongsStore } from './songs.store'
import { useBibleStore } from './bible.store'
import { usePresentationStore } from './presentation.store'
import { toast } from '@/components/shared/Toaster'

interface ServiceStore {
  // ── State ──────────────────────────────────
  plans: ServicePlan[]
  activePlan: ServicePlan | null
  activeItemIndex: number
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // ── Actions ────────────────────────────────
  fetchPlans: () => Promise<void>
  fetchPlan: (id: string) => Promise<void>
  createPlan: (title: string, serviceDate: string) => Promise<ServicePlan | null>
  updatePlan: (id: string, data: Partial<ServicePlan>) => Promise<void>
  deletePlan: (id: string) => Promise<void>
  duplicatePlan: (id: string) => Promise<ServicePlan | null>
  setActivePlan: (plan: ServicePlan | null) => void

  // Items
  addItem: (values: ServiceItemFormValues) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  updateItem: (itemId: string, values: Partial<ServiceItemFormValues>) => Promise<void>
  reorderItems: (items: ServiceItem[]) => Promise<void>

  // Navigation
  goToItem: (index: number) => void
  goNextItem: () => void
  goPrevItem: () => void

  // Realtime
  syncFromSocket: (planId: string, items: ServiceItem[], activeItemIndex: number) => void
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  plans: [],
  activePlan: null,
  activeItemIndex: -1,
  isLoading: false,
  isSaving: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true })
    try {
      const res = await fetch('/api/service')
      const plans: ServicePlan[] = await res.json()
      set({ plans, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  fetchPlan: async (id) => {
    set({ isLoading: true })
    try {
      const res = await fetch(`/api/service/${id}`)
      const plan: ServicePlan = await res.json()
      set({ activePlan: plan, isLoading: false })
    } catch (err) {
      set({ error: (err as Error).message, isLoading: false })
    }
  },

  createPlan: async (title, serviceDate) => {
    set({ isSaving: true })
    try {
      const res = await fetch('/api/service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, serviceDate, items: [] }),
      })
      const plan: ServicePlan = await res.json()
      set((state) => ({ plans: [plan, ...state.plans], isSaving: false }))
      toast.success('Plan created', title)
      return plan
    } catch {
      set({ isSaving: false })
      toast.error('Failed to create plan')
      return null
    }
  },

  updatePlan: async (id, data) => {
    try {
      await fetch(`/api/service/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      set((state) => ({
        plans: state.plans.map((p) => (p.id === id ? { ...p, ...data } : p)),
        activePlan: state.activePlan?.id === id ? { ...state.activePlan, ...data } : state.activePlan,
      }))
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  deletePlan: async (id) => {
    try {
      await fetch(`/api/service/${id}`, { method: 'DELETE' })
      set((state) => ({
        plans: state.plans.filter((p) => p.id !== id),
        activePlan: state.activePlan?.id === id ? null : state.activePlan,
      }))
      toast.info('Plan deleted')
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  duplicatePlan: async (id) => {
    const original = get().plans.find((p) => p.id === id)
    if (!original) return null
    const copy = await get().createPlan(
      `${original.title} (copy)`,
      new Date().toISOString().split('T')[0]
    )
    if (!copy) return null
    for (const item of original.items) {
      await get().addItem({
        type: item.type, refId: item.refId, title: item.title,
        subtitle: item.subtitle, notes: item.notes, durationMin: item.durationMin,
      })
    }
    toast.success('Plan duplicated', copy.title)
    return copy
  },

  setActivePlan: (plan) => set({ activePlan: plan, activeItemIndex: -1 }),

  addItem: async (values) => {
    const { activePlan } = get()
    if (!activePlan) return
    set({ isSaving: true })
    try {
      const res = await fetch(`/api/service/${activePlan.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const item: ServiceItem = await res.json()
      const updatedPlan = { ...activePlan, items: [...activePlan.items, item] }
      set({ activePlan: updatedPlan, isSaving: false })
      toast.success('Item added', values.title)
      _emitServiceSync(updatedPlan, get().activeItemIndex)
    } catch {
      set({ isSaving: false })
      toast.error('Failed to add item')
    }
  },

  removeItem: async (itemId) => {
    const { activePlan } = get()
    if (!activePlan) return
    try {
      await fetch(`/api/service/${activePlan.id}/items/${itemId}`, { method: 'DELETE' })
      const updatedPlan = { ...activePlan, items: activePlan.items.filter((i) => i.id !== itemId) }
      set({ activePlan: updatedPlan })
      toast.info('Item removed')
      _emitServiceSync(updatedPlan, get().activeItemIndex)
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  updateItem: async (itemId, values) => {
    const { activePlan } = get()
    if (!activePlan) return
    try {
      await fetch(`/api/service/${activePlan.id}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const updatedPlan = {
        ...activePlan,
        items: activePlan.items.map((i) =>
          i.id === itemId ? { ...i, ...values } : i
        ),
      }
      set({ activePlan: updatedPlan })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  reorderItems: async (items) => {
    const { activePlan } = get()
    if (!activePlan) return
    const updatedPlan = { ...activePlan, items }
    set({ activePlan: updatedPlan })
    _emitServiceSync(updatedPlan, get().activeItemIndex)

    try {
      await fetch(`/api/service/${activePlan.id}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map((i, idx) => ({ id: i.id, sortOrder: idx })) }),
      })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  goToItem: (index) => {
    const { activePlan } = get()
    if (!activePlan) return
    const item = activePlan.items[index]
    if (!item) return

    set({ activeItemIndex: index })
    _emitServiceSync(activePlan, index)

    // Auto-load item into presentation
    if (item.type === 'song' && item.refId) {
      const song = useSongsStore.getState().songs.find((s) => s.id === item.refId)
      if (song) useSongsStore.getState().loadToPresentation(song)
    }
    // Bible items carry slides directly
    if (item.type === 'bible' && item.slides) {
      usePresentationStore.getState().loadSlides(item.slides)
    }
  },

  goNextItem: () => {
    const { activeItemIndex, activePlan } = get()
    if (!activePlan) return
    get().goToItem(Math.min(activeItemIndex + 1, activePlan.items.length - 1))
  },

  goPrevItem: () => {
    const { activeItemIndex } = get()
    get().goToItem(Math.max(activeItemIndex - 1, 0))
  },

  syncFromSocket: (planId, items, activeItemIndex) => {
    set((state) => {
      if (state.activePlan?.id !== planId) return state
      return {
        activePlan: { ...state.activePlan, items },
        activeItemIndex,
      }
    })
  },
}))

function _emitServiceSync(plan: ServicePlan, activeItemIndex: number) {
  const socket = getSocket()
  socket.emit('service:sync', {
    planId: plan.id,
    items: plan.items,
    activeItemIndex,
  })
}
