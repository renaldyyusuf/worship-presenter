'use client'

import { useSongsStore } from '@/stores/songs.store'
import { useServiceStore } from '@/stores/service.store'
import { useBibleStore } from '@/stores/bible.store'
import { usePresentationStore } from '@/stores/presentation.store'
import { Music2, BookOpen, ListOrdered, Star, Calendar } from 'lucide-react'
import { formatServiceDate } from '@/lib/utils'

/**
 * Empty state dashboard shown in the center panel when no slides are loaded.
 * Displays quick library stats and today's/next service plan.
 */
export function LibraryDashboard() {
  const { songs } = useSongsStore()
  const { plans } = useServiceStore()
  const { results } = useBibleStore()

  const favorites    = songs.filter((s) => s.favorite)
  const totalSlides  = songs.reduce((n, s) => n + (s.slides?.length ?? 0), 0)

  // Find the most recent / upcoming service plan
  const today   = new Date().toISOString().split('T')[0]
  const upcoming = plans
    .filter((p) => p.serviceDate >= today)
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))[0]
    ?? plans.sort((a, b) => b.serviceDate.localeCompare(a.serviceDate))[0]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8 text-center">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        <StatCard
          icon={<Music2 className="h-5 w-5 text-indigo-400" />}
          value={songs.length}
          label="Songs"
          sub={`${favorites.length} favorites`}
        />
        <StatCard
          icon={<BookOpen className="h-5 w-5 text-blue-400" />}
          value={totalSlides}
          label="Slides"
          sub="in library"
        />
        <StatCard
          icon={<ListOrdered className="h-5 w-5 text-emerald-400" />}
          value={plans.length}
          label="Plans"
          sub="service plans"
        />
      </div>

      {/* Upcoming service */}
      {upcoming && (
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-5 py-4 w-full max-w-md text-left">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/25 mb-2 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {upcoming.serviceDate === today ? 'Today\'s Service' : 'Next Service'}
          </p>
          <p className="text-sm font-semibold text-white/80 mb-1">{upcoming.title}</p>
          <p className="text-xs text-white/35">{formatServiceDate(upcoming.serviceDate)}</p>
          {upcoming.items?.length > 0 && (
            <div className="mt-3 space-y-1">
              {upcoming.items.slice(0, 4).map((item, i) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="text-[11px] text-white/20 tabular-nums w-4">{i + 1}</span>
                  <span className="text-[11px] text-white/50 truncate">{item.title}</span>
                </div>
              ))}
              {upcoming.items.length > 4 && (
                <p className="text-[11px] text-white/20 pl-6">+{upcoming.items.length - 4} more</p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-white/15">
        Load a song or Bible verse from the left panel to begin
      </p>
    </div>
  )
}

function StatCard({ icon, value, label, sub }: {
  icon: React.ReactNode
  value: number
  label: string
  sub: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white/80 tabular-nums">{value.toLocaleString()}</p>
      <p className="text-xs font-medium text-white/50 mt-0.5">{label}</p>
      <p className="text-[11px] text-white/25 mt-0.5">{sub}</p>
    </div>
  )
}
