'use client'

import { create } from 'zustand'
import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────
// Toast store
// ─────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  durationMs: number
}

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    return id
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

// ─────────────────────────────────────────────
// Convenience helpers
// ─────────────────────────────────────────────
export const toast = {
  success: (title: string, description?: string) =>
    useToastStore.getState().add({ type: 'success', title, description, durationMs: 3000 }),
  error: (title: string, description?: string) =>
    useToastStore.getState().add({ type: 'error', title, description, durationMs: 5000 }),
  info: (title: string, description?: string) =>
    useToastStore.getState().add({ type: 'info', title, description, durationMs: 3000 }),
  warning: (title: string, description?: string) =>
    useToastStore.getState().add({ type: 'warning', title, description, durationMs: 4000 }),
}

// ─────────────────────────────────────────────
// Toaster component — mount in root layout
// ─────────────────────────────────────────────
export function Toaster() {
  const { toasts } = useToastStore()

  return (
    <div className="fixed bottom-16 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setVisible(true))

    // Auto-dismiss
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => remove(t.id), 300)
    }, t.durationMs)

    return () => clearTimeout(timer)
  }, [t.id, t.durationMs, remove])

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />,
    error:   <AlertCircle  className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />,
    info:    <Info          className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />,
  }

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-500/20',
    error:   'border-red-500/20',
    warning: 'border-amber-500/20',
    info:    'border-blue-500/20',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#161616] px-4 py-3 shadow-2xl shadow-black/60 max-w-[320px] transition-all duration-300',
        borders[t.type],
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
    >
      {icons[t.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 leading-snug">{t.title}</p>
        {t.description && (
          <p className="text-xs text-white/45 mt-0.5 leading-snug">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => remove(t.id), 300) }}
        className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
