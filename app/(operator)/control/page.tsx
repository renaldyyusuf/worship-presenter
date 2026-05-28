'use client'

import { useEffect, useState } from 'react'
import { usePresentationStore } from '@/stores/presentation.store'
import { useSongsStore } from '@/stores/songs.store'
import { useServiceStore } from '@/stores/service.store'
import { useStageStore } from '@/stores/stage-theme.store'
import { PresentationCanvas } from '@/components/presentation/PresentationCanvas'
import { BackgroundPicker } from '@/components/presentation/BackgroundPicker'
import { AnnouncementBuilder } from '@/components/presentation/AnnouncementBuilder'
import { StageWidgetControls } from '@/components/stage/StageWidgetControls'
import { AutoAdvancePanel } from '@/components/presentation/AutoAdvancePanel'
import { LibraryDashboard } from '@/components/shared/LibraryDashboard'
import { SlidePreviewGrid } from '../songs/_components/SlidePreviewGrid'
import {
  Layers, Play, Square, EyeOff, Image as ImageIcon,
  Monitor, ExternalLink, MessageSquare, Timer, Music2, Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type RightTab = 'preview' | 'stage' | 'announce'

export default function ControlPage() {
  const { fetchSongs } = useSongsStore()
  useEffect(() => { fetchSongs() }, [fetchSongs])
  return (
    <div className="flex h-full overflow-hidden">
      <LeftPanel />
      <CenterPanel />
      <RightPanel />
    </div>
  )
}

function LeftPanel() {
  const [tab, setTab] = useState<'queue' | 'songs'>('queue')
  const { slideQueue, currentIndex, goTo } = usePresentationStore()
  const { searchQuery, setSearchQuery, getFilteredSongs, loadToPresentation } = useSongsStore()
  const filtered = getFilteredSongs()

  return (
    <div className="w-[256px] flex-shrink-0 border-r border-white/[0.06] flex flex-col overflow-hidden bg-[#0d0d0d]">
      <div className="flex border-b border-white/[0.06]">
        {(['queue', 'songs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 py-2.5 text-xs capitalize font-medium border-b-2 transition-colors',
              tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-white/35 hover:text-white/60')}>
            {t}
            {t === 'queue' && slideQueue.length > 0 && (
              <span className="ml-1 text-white/25">{slideQueue.length}</span>
            )}
          </button>
        ))}
      </div>
      {tab === 'queue' ? (
        <div className="flex-1 overflow-y-auto">
          {slideQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <Layers className="h-8 w-8 text-white/10" />
              <p className="text-xs text-white/25">No slides loaded.</p>
            </div>
          ) : (
            <div className="p-2 space-y-0.5">
              {slideQueue.map((slide, i) => (
                <button key={slide.id} onClick={() => goTo(i)}
                  className={cn('w-full text-left rounded-md px-3 py-2 transition-colors',
                    i === currentIndex ? 'bg-indigo-500/15 border border-indigo-500/25' : 'hover:bg-white/[0.04] border border-transparent')}>
                  {slide.sectionLabel && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-0.5">{slide.sectionLabel}</p>
                  )}
                  <p className="text-xs text-white/70 leading-snug line-clamp-2">{slide.content}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-2">
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs…"
              className="w-full h-8 rounded bg-white/[0.05] px-3 text-xs text-white placeholder:text-white/30 border border-white/[0.06] focus:outline-none focus:border-indigo-500/40" />
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filtered.map((song) => (
              <button key={song.id} onClick={() => loadToPresentation(song)}
                className="w-full text-left rounded-md px-3 py-2 hover:bg-white/[0.05] transition-colors">
                <p className="text-xs font-medium text-white/75 truncate">{song.title}</p>
                {song.artist && <p className="text-[11px] text-white/30 truncate">{song.artist}</p>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CenterPanel() {
  const { slideQueue, currentIndex, currentSlide } = usePresentationStore()
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-[#0d0d0d] flex-shrink-0">
        <span className="text-xs text-white/30 font-medium truncate">{currentSlide?.sectionLabel ?? 'No slide loaded'}</span>
        <div className="flex-1" />
        <span className="text-xs text-white/20 tabular-nums font-mono">
          {slideQueue.length > 0 ? `${currentIndex + 1} / ${slideQueue.length}` : '—'}
        </span>
        <div className="h-4 w-px bg-white/[0.06]" />
        <a href="/output" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-7 rounded px-2.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors">
          <Monitor className="h-3.5 w-3.5" />Output<ExternalLink className="h-3 w-3 opacity-40" />
        </a>
        <a href="/stage" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 h-7 rounded px-2.5 text-xs text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors">
          <Layers className="h-3.5 w-3.5" />Stage<ExternalLink className="h-3 w-3 opacity-40" />
        </a>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {slideQueue.length > 0 ? (
          <SlidePreviewGrid slides={slideQueue} />
        ) : (
          <LibraryDashboard />
        )}
      </div>
    </div>
  )
}

function RightPanel() {
  const [tab, setTab] = useState<RightTab>('preview')
  const { currentSlide, nextSlide, mode, background, theme, toggleBlack, toggleClear, toggleLogo } = usePresentationStore()

  return (
    <div className="w-[240px] flex-shrink-0 border-l border-white/[0.06] flex flex-col overflow-hidden bg-[#0d0d0d]">
      <div className="flex border-b border-white/[0.06]">
        {(['preview', 'stage', 'announce'] as RightTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('flex-1 py-2.5 text-[10px] capitalize font-medium border-b-2 transition-colors',
              tab === t ? 'border-indigo-500 text-white' : 'border-transparent text-white/30 hover:text-white/60')}>
            {t === 'announce' ? 'Announce' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'preview' && (
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 border-b border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />Live
              </p>
              <BackgroundPicker />
            </div>
            <div className="aspect-video rounded-md overflow-hidden border border-white/[0.08]">
              <PresentationCanvas currentSlide={currentSlide} mode={mode} background={background} theme={theme} preview className="w-full h-full" />
            </div>
          </div>
          <div className="p-3 border-b border-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Next</p>
            <div className="aspect-video rounded-md overflow-hidden border border-white/[0.06] opacity-55">
              <PresentationCanvas currentSlide={nextSlide} mode="normal" background={background} theme={theme} preview className="w-full h-full" />
            </div>
          </div>
          <div className="p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-2">Screen</p>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                ['Black', Square,    mode === 'black', toggleBlack, 'bg-white/10 text-white border-white/20'],
                ['Clear', EyeOff,    mode === 'clear', toggleClear, 'bg-amber-500/15 text-amber-400 border-amber-500/30'],
                ['Logo',  ImageIcon, mode === 'logo',  toggleLogo,  'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'],
              ] as [string, any, boolean, () => void, string][]).map(([label, Icon, active, onClick, ac]) => (
                <button key={label} onClick={onClick}
                  className={cn('flex flex-col items-center gap-1 rounded-md py-2 text-[10px] font-medium border transition-all',
                    active ? ac : 'text-white/30 border-white/[0.06] hover:bg-white/[0.05] hover:text-white/60')}>
                  <Icon className="h-3.5 w-3.5" />{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'stage' && <StageControls />}
      {tab === 'announce' && (
        <div className="flex-1 overflow-y-auto p-3">
          <AnnouncementBuilder />
        </div>
      )}
    </div>
  )
}

function StageControls() {
  const { showMessageBanner, hideMessage, startTimer, stopTimer } = useStageStore()
  const [msgInput, setMsgInput] = useState('')
  const [timerMin, setTimerMin] = useState('5')

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-white/[0.06]">
      <div className="p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
          <MessageSquare className="h-3 w-3" />Stage Message
        </p>
        <input value={msgInput} onChange={(e) => setMsgInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && msgInput.trim()) { showMessageBanner(msgInput.trim()); setMsgInput('') }}}
          placeholder="Type message…"
          className="w-full h-8 rounded bg-white/[0.05] px-2.5 text-xs text-white placeholder:text-white/25 border border-white/[0.06] focus:outline-none focus:border-indigo-500/40" />
        <div className="flex gap-1.5">
          <button onClick={() => { if (msgInput.trim()) { showMessageBanner(msgInput.trim()); setMsgInput('') }}}
            className="flex-1 h-7 rounded bg-indigo-600/80 text-xs text-white hover:bg-indigo-600 transition-colors">Show</button>
          <button onClick={hideMessage}
            className="flex-1 h-7 rounded border border-white/[0.07] text-xs text-white/40 hover:bg-white/[0.04] transition-colors">Hide</button>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 flex items-center gap-1.5">
          <Timer className="h-3 w-3" />Timer
        </p>
        <div className="flex gap-2 items-center">
          <input type="number" value={timerMin} onChange={(e) => setTimerMin(e.target.value)} min={1} max={99}
            className="w-16 h-8 rounded bg-white/[0.05] px-2.5 text-xs text-white border border-white/[0.06] focus:outline-none focus:border-indigo-500/40 tabular-nums" />
          <span className="text-xs text-white/30">min</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => startTimer(parseInt(timerMin || '5') * 60 * 1000)}
            className="flex-1 h-7 rounded bg-indigo-600/80 text-xs text-white hover:bg-indigo-600 transition-colors">Start</button>
          <button onClick={stopTimer}
            className="flex-1 h-7 rounded border border-white/[0.07] text-xs text-white/40 hover:bg-white/[0.04] transition-colors">Stop</button>
        </div>
        <div className="flex gap-1 flex-wrap">
          {[1,3,5,10,15,20].map((m) => (
            <button key={m} onClick={() => { setTimerMin(String(m)); startTimer(m * 60 * 1000) }}
              className="h-6 px-2 rounded text-[11px] border border-white/[0.07] text-white/40 hover:bg-white/[0.05] transition-colors">{m}m</button>
          ))}
        </div>
      </div>
      <div className="p-3">
        <StageWidgetControls />
      </div>
      <div className="p-3 border-t border-white/[0.06]">
        <AutoAdvancePanel />
      </div>
      <div className="p-3 border-t border-white/[0.06]">
        <a href="/stage" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 h-8 rounded-md border border-white/[0.07] px-3 text-xs text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors">
          <ExternalLink className="h-3.5 w-3.5" />Open Stage Display
        </a>
      </div>
    </div>
  )
}
