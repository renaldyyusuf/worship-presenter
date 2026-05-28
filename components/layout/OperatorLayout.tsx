'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Music2, BookOpen, FolderOpen, ListOrdered,
  Settings, Monitor, Layers, ChevronLeft, ChevronRight,
  Square, EyeOff, Image as ImageIcon, ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePresentationStore } from '@/stores/presentation.store'
import { usePresentationStore } from '@/stores/presentation.store'
import { SocketProvider } from '@/components/shared/SocketProvider'
import { ConnectionStatus } from '@/components/shared/ConnectionStatus'
import { KeyboardShortcutsOverlay } from '@/components/shared/KeyboardShortcutsOverlay'
import { CommandPalette, useCommandPalette } from '@/components/shared/CommandPalette'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useSettingsStore } from '@/stores/settings.store'

const NAV_ITEMS = [
  { href: '/control',  icon: Monitor,      label: 'Control' },
  { href: '/songs',    icon: Music2,       label: 'Songs' },
  { href: '/bible',    icon: BookOpen,     label: 'Bible' },
  { href: '/media',    icon: FolderOpen,   label: 'Media' },
  { href: '/service',  icon: ListOrdered,  label: 'Service' },
  { href: '/settings', icon: Settings,     label: 'Settings' },
]

export function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider role="operator">
      <LayoutInner>{children}</LayoutInner>
    </SocketProvider>
  )
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts({ enabled: true })
  const { open, setOpen } = useCommandPalette()
  const { output, fetchSettings } = useSettingsStore()
  const { setLogoUrl } = usePresentationStore()

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  useEffect(() => {
    if (output.logoUrl) setLogoUrl(output.logoUrl)
  }, [output.logoUrl, setLogoUrl])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0a] text-white">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-hidden">{children}</main>
        <BottomBar />
      </div>
      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </div>
  )
}

// ─────────────────────────────────────────────
// Left sidebar
// ─────────────────────────────────────────────
function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex w-[60px] flex-col items-center border-r border-white/[0.06] bg-[#0d0d0d] py-3 gap-0.5">
      {/* Logo */}
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 flex-shrink-0">
        <Layers className="h-5 w-5 text-white" />
      </div>

      <div className="w-full px-2 mb-1">
        <div className="h-px w-full bg-white/[0.06]" />
      </div>

      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active =
          pathname === href ||
          (href !== '/control' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className={cn(
              'group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all',
              active
                ? 'bg-white/[0.10] text-white shadow-sm'
                : 'text-white/35 hover:bg-white/[0.06] hover:text-white/70'
            )}
          >
            <Icon className="h-[18px] w-[18px]" />
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-r bg-indigo-500" />
            )}
          </Link>
        )
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Connection dot */}
      <ConnectionStatus />

      <div className="w-full px-2 my-1">
        <div className="h-px w-full bg-white/[0.06]" />
      </div>

      {/* Open output */}
      <a
        href="/output"
        target="_blank"
        rel="noopener noreferrer"
        title="Open Output Window"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-colors"
      >
        <ExternalLink className="h-[17px] w-[17px]" />
      </a>
    </aside>
  )
}

// ─────────────────────────────────────────────
// Bottom control bar
// ─────────────────────────────────────────────
function BottomBar() {
  const {
    currentIndex, totalSlides, currentSlide, nextSlide,
    mode, goNext, goPrev, toggleBlack, toggleClear, toggleLogo,
  } = usePresentationStore()

  return (
    <footer className="flex h-11 items-center gap-2 border-t border-white/[0.06] bg-[#0d0d0d] px-3 flex-shrink-0">
      {/* Slide counter */}
      <span className="text-xs text-white/25 tabular-nums min-w-[52px] font-mono">
        {totalSlides > 0 ? `${currentIndex + 1} / ${totalSlides}` : '— / —'}
      </span>

      <div className="h-4 w-px bg-white/[0.08]" />

      {/* Prev */}
      <button
        onClick={goPrev}
        disabled={currentIndex === 0 || totalSlides === 0}
        className="flex h-7 items-center gap-1 rounded px-2 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Prev
      </button>

      {/* Next */}
      <button
        onClick={goNext}
        disabled={currentIndex >= totalSlides - 1 || totalSlides === 0}
        className="flex h-7 items-center gap-1 rounded px-2 text-xs text-white/50 hover:bg-white/[0.06] hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="h-3.5 w-3.5" />
      </button>

      <div className="h-4 w-px bg-white/[0.08]" />

      {/* Mode buttons */}
      <BottomModeBtn label="Black" icon={<Square className="h-3 w-3" />}   active={mode === 'black'} onClick={toggleBlack} activeClass="bg-white/10 text-white border-white/20" />
      <BottomModeBtn label="Clear" icon={<EyeOff className="h-3 w-3" />}   active={mode === 'clear'} onClick={toggleClear} activeClass="bg-amber-500/15 text-amber-400 border-amber-500/30" />
      <BottomModeBtn label="Logo"  icon={<ImageIcon className="h-3 w-3" />} active={mode === 'logo'}  onClick={toggleLogo}  activeClass="bg-indigo-500/15 text-indigo-400 border-indigo-500/30" />

      {/* Slide progress dots (compact) */}
      {totalSlides > 0 && totalSlides <= 20 && (
        <div className="hidden lg:flex items-center gap-0.5 mx-2 flex-shrink-0">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => usePresentationStore.getState().goTo(i)}
              className={cn(
                'rounded-full transition-all',
                i === currentIndex
                  ? 'h-2 w-2 bg-indigo-400'
                  : 'h-1.5 w-1.5 bg-white/15 hover:bg-white/35'
              )}
            />
          ))}
        </div>
      )}
      {totalSlides > 20 && (
        <div className="hidden lg:block h-1 w-24 rounded-full bg-white/[0.08] overflow-hidden flex-shrink-0 mx-2">
          <div
            className="h-full bg-indigo-500/60 transition-all duration-200"
            style={{ width: totalSlides > 1 ? `${(currentIndex / (totalSlides - 1)) * 100}%` : '100%' }}
          />
        </div>
      )}
        <>
          <div className="h-4 w-px bg-white/[0.08] ml-1" />
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {currentSlide.sectionLabel && (
              <span className="text-[11px] text-white/20 font-medium uppercase tracking-wider flex-shrink-0">
                {currentSlide.sectionLabel}
              </span>
            )}
            <span className="text-xs text-white/35 truncate">
              {currentSlide.content.split('\n')[0]}
            </span>
          </div>
          {nextSlide && (
            <span className="text-[11px] text-white/20 truncate max-w-[160px] hidden lg:block flex-shrink-0">
              → {nextSlide.content.split('\n')[0]}
            </span>
          )}
        </>
      )}

      <div className="flex-1" />

      {/* Cmd+K hint */}
      <div className="hidden md:flex items-center gap-1 text-[11px] text-white/15 mr-1">
        <kbd className="px-1.5 py-0.5 rounded border border-white/[0.08] font-mono text-[10px]">⌘K</kbd>
        <span>search</span>
      </div>

      {/* Keyboard shortcuts toggle */}
      <KeyboardShortcutsOverlay />
    </footer>
  )
}

function BottomModeBtn({
  label, icon, active, onClick, activeClass,
}: {
  label: string; icon: React.ReactNode; active: boolean
  onClick: () => void; activeClass: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex h-7 items-center gap-1.5 rounded px-2.5 text-[11px] font-medium border transition-all',
        active ? activeClass : 'border-transparent text-white/35 hover:bg-white/[0.05] hover:text-white/60'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
