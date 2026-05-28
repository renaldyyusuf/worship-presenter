'use client'

import { useSocketStatus } from '@/hooks/useSocketStatus'
import { cn } from '@/lib/utils'

export function ConnectionStatus() {
  const status = useSocketStatus()

  const config = {
    connected:    { dot: 'bg-emerald-500',            label: 'Live' },
    connecting:   { dot: 'bg-amber-500 animate-pulse', label: 'Connecting…' },
    disconnected: { dot: 'bg-red-500',                 label: 'Offline' },
    error:        { dot: 'bg-red-500 animate-pulse',   label: 'Error' },
  }[status]

  return (
    <div
      title={`Socket: ${status}`}
      className={cn(
        'flex items-center gap-1.5 text-[11px] font-medium transition-colors',
        status === 'connected'  ? 'text-white/30' :
        status === 'connecting' ? 'text-amber-400/70' :
        'text-red-400/70'
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full flex-shrink-0', config.dot)} />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  )
}
